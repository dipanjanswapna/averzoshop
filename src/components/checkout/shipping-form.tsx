
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { CardHeader, CardTitle } from '../ui/card';
import { useCart } from '@/hooks/use-cart';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, doc, setDoc, updateDoc, arrayUnion, runTransaction, increment, DocumentReference, serverTimestamp } from 'firebase/firestore';
import { calculateDistance } from '@/lib/distance';
import type { Outlet } from '@/types/outlet';
import type { Product, ProductVariant } from '@/types/product';
import { useRouter } from 'next/navigation';
import type { Order, ShippingAddress } from '@/types/order';
import { Label } from '../ui/label';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { createSslCommerzSession } from '@/actions/payment-actions';
import { Store, PlusCircle, Home, Briefcase, MapPin } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { AddressDialog } from '../customer/address-dialog';
import { Address } from '@/types/address';


const formSchema = z.object({
  paymentMethod: z.enum(['cod', 'online'], { required_error: 'You need to select a payment method.' }),
});

const addressIcons: { [key: string]: React.ReactNode } = {
  Home: <Home size={16} />,
  Office: <Briefcase size={16} />,
  Other: <MapPin size={16} />,
};

const couriers = ['RedX', 'Steadfast', 'Paperfly', 'Sundarban Courier'];


export function ShippingForm() {
    const { 
        cartItems, clearCart, totalPayable, subtotal, fullOrderTotal, promoCode, 
        discount, setShippingInfo, shippingInfo, pointsApplied, pointsDiscount,
        orderMode, setOrderMode, pickupOutletId, setPickupOutlet, cardPromoDiscountAmount,
        giftCardCode, giftCardDiscount, shippingMethod, courierName, setShippingDetails
    } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const { firestore } = useFirebase();
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: 'cod',
    },
  });

  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(userData.addresses[0].id);
    } else if (!userData?.addresses || userData.addresses.length === 0) {
        setIsAddressDialogOpen(true);
    }
  }, [userData, selectedAddressId]);
  
  const suitablePickupOutlets = useMemo(() => {
      if (!allOutlets || !allProducts) return [];
      return allOutlets.filter(outlet => 
          outlet.status === 'Active' &&
          cartItems.every(cartItem => {
              const product = allProducts.find(p => p.id === cartItem.product.id);
              if (!product || product.preOrder?.enabled) return true;
              const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
              const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
              return (variant?.outlet_stocks?.[outlet.id] ?? 0) >= cartItem.quantity;
          })
      );
  }, [allOutlets, allProducts, cartItems]);


  useEffect(() => {
    const calculateShipping = () => {
        const regularItems = cartItems.filter(item => !item.isPreOrder);
        const selectedAddress = userData?.addresses?.find(a => a.id === selectedAddressId);
        
        if (orderMode === 'pickup') {
            setShippingInfo({ fee: 0, outletId: pickupOutletId, distance: null, estimate: 'Ready for Pickup' });
            return;
        }

        if (regularItems.length === 0) {
            setShippingInfo({ fee: 0, outletId: 'pre-order-fulfillment', distance: null, estimate: 'Upon Release' });
            return;
        }

        if (!selectedAddress) {
            setShippingInfo({ fee: 0, outletId: null, distance: null, estimate: 'Select an address' });
            return;
        }

        const suitableDeliveryOutlets = suitablePickupOutlets; // Same logic for delivery

        if (selectedAddress.coordinates?.lat && selectedAddress.coordinates?.lng && suitableDeliveryOutlets.length > 0) {
            const customerCoords = { lat: selectedAddress.coordinates.lat, lng: selectedAddress.coordinates.lng };
            const outletsWithDistance = suitableDeliveryOutlets.map(outlet => ({ ...outlet, distance: calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng)}));
            const sortedOutlets = outletsWithDistance.sort((a, b) => a.distance - b.distance);
            const assignedOutlet = sortedOutlets.find(o => o.distance <= 5) || sortedOutlets[0];

            let fee = (assignedOutlet.distance <= 5) ? 40 : (selectedAddress.district || '').toLowerCase().includes('dhaka') ? 60 : 120;
            let estimate = (assignedOutlet.distance <= 5) ? '1-2 Hours (Express)' : (selectedAddress.district || '').toLowerCase().includes('dhaka') ? '1-2 Days' : '3-5 Days';
            setShippingInfo({ fee, outletId: assignedOutlet.id, distance: assignedOutlet.distance, estimate });
            return;
        }

        let fee = (selectedAddress.district || '').toLowerCase().includes('dhaka') ? 60 : 120;
        let estimate = (selectedAddress.district || '').toLowerCase().includes('dhaka') ? '1-2 Days' : '3-5 Days';
        
        let bestOutletId: string | null = suitableDeliveryOutlets.length > 0 ? suitableDeliveryOutlets[0].id : null;

        if (!bestOutletId && regularItems.length > 0) {
            setShippingInfo({ fee: 0, outletId: null, distance: null, estimate: 'Unavailable' });
            return;
        }
        setShippingInfo({ fee, outletId: bestOutletId, distance: null, estimate });
    };

    calculateShipping();
  }, [orderMode, pickupOutletId, selectedAddressId, cartItems, allProducts, allOutlets, userData, setShippingInfo, suitablePickupOutlets]);
  
  const handleSaveAddress = async (addressData: Omit<Address, 'id'>, id?: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in' });
      return;
    }
    setIsSavingAddress(true);
    const userRef = doc(firestore, 'users', user.uid);
    const currentAddresses = userData?.addresses || [];
    let updatedAddresses: Address[];
    const newAddressId = id || Date.now().toString();

    if (id) {
        updatedAddresses = currentAddresses.map(addr => addr.id === id ? { ...addr, ...addressData } : addr);
    } else {
        const newAddress: Address = { ...addressData, id: newAddressId };
        updatedAddresses = [...currentAddresses, newAddress];
    }
    
    try {
        await updateDoc(userRef, { addresses: updatedAddresses });
        toast({ title: `Address ${id ? 'updated' : 'saved'} successfully!` });
        setSelectedAddressId(newAddressId);
        setIsAddressDialogOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to save address', description: error.message });
    } finally {
        setIsSavingAddress(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const selectedAddress = userData?.addresses?.find(a => a.id === selectedAddressId);
    
    if (orderMode === 'delivery' && !selectedAddress) {
      toast({ variant: 'destructive', title: 'Please select or add a shipping address.' });
      setIsLoading(false);
      return;
    }
     if (orderMode === 'delivery' && !shippingMethod) {
      toast({ variant: 'destructive', title: 'Please select a delivery partner.' });
      setIsLoading(false);
      return;
    }

    if (!firestore || !user || !userData || cartItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process order. Please try again.' });
      setIsLoading(false);
      return;
    }
    
    if (orderMode === 'pickup' && !pickupOutletId) {
        toast({ variant: 'destructive', title: 'Please select a pickup outlet.' });
        setIsLoading(false);
        return;
    }
    if (orderMode === 'delivery' && !shippingInfo.outletId && cartItems.some(item => !item.isPreOrder)) {
        toast({ variant: 'destructive', title: 'Cannot Place Order', description: 'We could not find a suitable outlet to fulfill your order.' });
        setIsLoading(false);
        return;
    }

    const finalShippingAddress: ShippingAddress | null = orderMode === 'delivery' ? {
        name: selectedAddress!.name, phone: selectedAddress!.phone, district: selectedAddress!.district,
        area: selectedAddress!.area, streetAddress: selectedAddress!.streetAddress,
    } : null;

    const orderId = doc(collection(firestore, 'orders')).id;
    const isPreOrderInCart = cartItems.some(item => item.isPreOrder);
    const assignedOutletId = orderMode === 'pickup' ? pickupOutletId : shippingInfo.outletId;
    const pickupCode = orderMode === 'pickup' ? `AZ-${Math.floor(1000 + Math.random() * 9000)}` : null;

    const baseOrderData: Omit<Order, 'status' | 'createdAt' | 'paymentStatus'> = {
        id: orderId, customerId: user.uid, items: cartItems.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
        subtotal: subtotal, cardPromoDiscountAmount: cardPromoDiscountAmount, discountAmount: discount, promoCode: promoCode ? promoCode.code : null, loyaltyPointsUsed: pointsApplied, loyaltyDiscount: pointsDiscount,
        giftCardCode: giftCardCode, giftCardDiscount: giftCardDiscount,
        totalAmount: totalPayable, fullOrderValue: fullOrderTotal, orderType: isPreOrderInCart ? 'pre-order' as const : 'regular' as const,
        orderMode: orderMode, pickupOutletId: orderMode === 'pickup' ? pickupOutletId : null,
        assignedOutletId: assignedOutletId || null, pickupCode: pickupCode, shippingAddress: finalShippingAddress,
        shippingMethod: shippingMethod || undefined,
        courierName: courierName || null,
    };

    if (values.paymentMethod === 'cod') {
        try {
            await runTransaction(firestore, async (transaction) => {
                const userRef = doc(firestore, 'users', user.uid);
                
                const regularItems = cartItems.filter(item => !item.isPreOrder);
                if (regularItems.length > 0) {
                    const productRefs = regularItems.map(item => doc(firestore, 'products', item.product.id));
                    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                    for (let i = 0; i < regularItems.length; i++) {
                        const item = regularItems[i];
                        const productDoc = productDocs[i];
                        if (!productDoc.exists()) throw new Error(`Product ${item.product.name} not found.`);
                        const productData = productDoc.data() as Product;
                        const variantsArray = Array.isArray(productData.variants) ? JSON.parse(JSON.stringify(productData.variants)) : JSON.parse(JSON.stringify(Object.values(productData.variants || {})));
                        const variantIndex = variantsArray.findIndex((v: ProductVariant) => v.sku === item.variant.sku);
                        if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found.`);
                        const variant = variantsArray[variantIndex];
                        const currentStock = variant.outlet_stocks?.[assignedOutletId!] ?? 0;
                        if (currentStock < item.quantity) throw new Error(`Not enough stock for ${productData.name}.`);
                        variantsArray[variantIndex].stock = (variant.stock || 0) - item.quantity;
                        if (variantsArray[variantIndex].outlet_stocks) variantsArray[variantIndex].outlet_stocks[assignedOutletId!] = currentStock - item.quantity;
                        transaction.update(productRefs[i], { variants: variantsArray, total_stock: increment(-item.quantity) });
                    }
                }
                const orderRef = doc(firestore, 'orders', orderId);
                const orderDataForCod: Order = { ...baseOrderData, status: isPreOrderInCart ? 'pre-ordered' : 'new', paymentStatus: 'Unpaid', createdAt: new Date() as any };
                transaction.set(orderRef, orderDataForCod);
                
                if (pointsApplied > 0) {
                    transaction.update(userRef, { loyaltyPoints: increment(-pointsApplied) });
                }
            });
            clearCart();
            toast({ title: 'Order Placed!', description: `Your order has been confirmed.` });
            router.push('/customer/my-orders');
        } catch (error: any) {
            console.error("COD Order placement failed:", error);
            toast({ variant: 'destructive', title: 'Order Failed', description: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsLoading(false);
        }
    } else if (values.paymentMethod === 'online') {
        try {
            const orderDataForOnline: Order = { ...baseOrderData, status: 'pending_payment', paymentStatus: 'Unpaid' } as Order;
            await setDoc(doc(firestore, 'orders', orderId), orderDataForOnline);
            const session = await createSslCommerzSession(orderDataForOnline, userData);
            if (session.redirectUrl) window.location.href = session.redirectUrl;
            else throw new Error("Could not get payment URL from gateway.");
        } catch (error: any) {
            console.error("Online payment initiation failed:", error);
            toast({ variant: 'destructive', title: 'Payment Failed', description: error.message || 'Could not connect to payment gateway.' });
            setIsLoading(false);
        }
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl">Shipping &amp; Payment</CardTitle>
            </CardHeader>
            
            <FormField
              control={form.control}
              name="paymentMethod" 
              render={() => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <FormControl>
                  <RadioGroup onValueChange={(value: 'delivery' | 'pickup') => setOrderMode(value)} value={orderMode} className="grid grid-cols-2 gap-4">
                    <FormItem><FormControl>
                      <Label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                        <RadioGroupItem value="delivery" /> Home Delivery
                      </Label>
                    </FormControl></FormItem>
                    <FormItem><FormControl>
                      <Label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                        <RadioGroupItem value="pickup" /> Store Pickup
                      </Label>
                    </FormControl></FormItem>
                  </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {orderMode === 'delivery' && (
              <>
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <FormLabel>Select a shipping address</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setAddressToEdit(null); setIsAddressDialogOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New
                        </Button>
                    </div>
                    {userData?.addresses && userData.addresses.length > 0 ? (
                        <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {userData.addresses.map(address => (
                                <FormItem key={address.id}>
                                    <FormControl>
                                    <Label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                        <RadioGroupItem value={address.id} className="mt-1 flex-shrink-0"/>
                                        <div className="text-xs">
                                            <p className="font-bold text-sm flex items-center gap-1.5">{addressIcons[address.label]} {address.name}</p>
                                            <p className="text-muted-foreground">{address.streetAddress}, {address.area}</p>
                                            <p className="text-muted-foreground">{address.phone}</p>
                                        </div>
                                    </Label>
                                    </FormControl>
                                </FormItem>
                            ))}
                        </RadioGroup>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No saved addresses. Please add one.</p>
                    )}
                </div>
                 <div className="space-y-4 pt-4 border-t">
                  <FormLabel>Delivery Partner</FormLabel>
                   <RadioGroup 
                    onValueChange={(value) => {
                      const [method, name] = value.split(':');
                      setShippingDetails({ method: method as any, courierName: name || null });
                    }} 
                    value={shippingMethod ? `${shippingMethod}:${courierName || ''}` : ''}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <FormItem>
                      <FormControl>
                        <Label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                          <RadioGroupItem value="averzo_rider:" /> Averzo Rider
                        </Label>
                      </FormControl>
                    </FormItem>
                    {couriers.map(c => (
                      <FormItem key={c}>
                        <FormControl>
                          <Label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value={`third_party_courier:${c}`} /> {c}
                          </Label>
                        </FormControl>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {orderMode === 'pickup' && (
                <div className="space-y-4 pt-4 border-t">
                    <FormLabel>Select Pickup Outlet</FormLabel>
                    {outletsLoading ? <p>Loading outlets...</p> : suitablePickupOutlets.length > 0 ? (
                        <ScrollArea className="h-48 rounded-md border">
                            <RadioGroup onValueChange={setPickupOutlet} value={pickupOutletId || ''} className="p-4 space-y-3">
                                {suitablePickupOutlets.map(outlet => (
                                    <FormItem key={outlet.id}><FormControl>
                                        <Label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                            <RadioGroupItem value={outlet.id} className="mt-1" />
                                            <div>
                                                <p className="font-bold text-sm flex items-center gap-2"><Store size={14}/> {outlet.name}</p>
                                                <p className="text-xs text-muted-foreground">{outlet.location.address}</p>
                                            </div>
                                        </Label>
                                    </FormControl></FormItem>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                    ) : (
                        <div className="text-center text-muted-foreground p-6 border-2 border-dashed rounded-lg">
                           <p>No outlets can fulfill your current cart. Try removing some items.</p>
                        </div>
                    )}
                </div>
            )}

            <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                <FormItem className="space-y-3 pt-4 border-t">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="cod" /></FormControl>
                        <FormLabel className="font-normal">Cash on Delivery / Pay at Store</FormLabel>
                        </FormItem>
                        <FormItem>
                            <div className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="online" /></FormControl>
                                <FormLabel className="font-normal">Online Payment</FormLabel>
                            </div>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || (orderMode === 'delivery' && !selectedAddressId) || (orderMode === 'pickup' && !pickupOutletId) || (orderMode === 'delivery' && !shippingMethod)}>
                {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
        </form>
      </Form>
       <AddressDialog
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        onSave={handleSaveAddress}
        addressToEdit={addressToEdit}
        isLoading={isSavingAddress}
      />
    </>
  );
}
