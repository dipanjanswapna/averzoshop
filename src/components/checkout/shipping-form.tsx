
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { CardHeader, CardTitle } from '../ui/card';
import { useCart } from '@/hooks/use-cart';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, doc, setDoc, runTransaction, increment, DocumentReference, serverTimestamp } from 'firebase/firestore';
import { calculateDistance } from '@/lib/distance';
import type { Outlet } from '@/types/outlet';
import type { Product, ProductVariant } from '@/types/product';
import { useRouter } from 'next/navigation';
import type { Order, ShippingAddress } from '@/types/order';
import { Label } from '../ui/label';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { createSslCommerzSession } from '@/actions/payment-actions';
import { Store } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(11, { message: 'Phone number must be valid.' }),
  division: z.string().min(1, 'Division is required.'),
  district: z.string().min(1, 'District is required.'),
  upazila: z.string().min(1, 'Upazila/Thana is required.'),
  area: z.string().min(1, 'Area/Post Office is required.'),
  streetAddress: z.string().min(1, 'Street address is required.'),
  paymentMethod: z.enum(['cod', 'online'], { required_error: 'You need to select a payment method.' }),
});

export function ShippingForm() {
    const { 
        cartItems, clearCart, totalPayable, subtotal, fullOrderTotal, promoCode, 
        discount, setShippingInfo, shippingInfo, pointsApplied, pointsDiscount,
        orderMode, setOrderMode, pickupOutletId, setPickupOutlet
    } = useCart(state => ({
        cartItems: state.items,
        clearCart: state.clearCart,
        totalPayable: state.totalPayable,
        subtotal: state.subtotal,
        fullOrderTotal: state.fullOrderTotal,
        promoCode: state.promoCode,
        discount: state.discount,
        pointsApplied: state.pointsApplied,
        pointsDiscount: state.pointsDiscount,
        setShippingInfo: state.setShippingInfo,
        shippingInfo: state.shippingInfo,
        orderMode: state.orderMode,
        setOrderMode: state.setOrderMode,
        pickupOutletId: state.pickupOutletId,
        setPickupOutlet: state.setPickupOutlet,
    }));

  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [suitablePickupOutlets, setSuitablePickupOutlets] = useState<Outlet[]>([]);

  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userData?.displayName || '',
      phone: '',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: '',
      area: '',
      streetAddress: '',
      paymentMethod: 'cod',
    },
  });
  
  const watchedDistrict = form.watch('district');

  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(userData.addresses[0].id);
    }
  }, [userData, selectedAddressId]);
  
  useEffect(() => {
    if (orderMode === 'delivery' && selectedAddressId && userData?.addresses) {
      const selected = userData.addresses.find(a => a.id === selectedAddressId);
      if (selected) {
        form.reset({
          name: selected.name,
          phone: selected.phone,
          division: selected.division,
          district: selected.district,
          upazila: selected.upazila,
          area: selected.area,
          streetAddress: selected.streetAddress,
          paymentMethod: form.getValues('paymentMethod'),
        });
      }
    }
  }, [orderMode, selectedAddressId, userData, form]);

  useEffect(() => {
    const calculateShipping = () => {
        const regularItems = cartItems.filter(item => !item.isPreOrder);

        if (!allOutlets || !allProducts) return;
        
        const suitableOutlets = allOutlets.filter(outlet => 
            outlet.status === 'Active' &&
            regularItems.every(cartItem => {
                const product = allProducts.find(p => p.id === cartItem.product.id);
                if (!product) return false;
                const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
                const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
                return (variant?.outlet_stocks?.[outlet.id] ?? 0) >= cartItem.quantity;
            })
        );
        
        setSuitablePickupOutlets(suitableOutlets);
        
        if (orderMode === 'pickup') {
            setShippingInfo({ fee: 0, outletId: pickupOutletId, distance: null, estimate: 'Ready for Pickup' });
            return;
        }

        if (regularItems.length === 0) {
            setShippingInfo({ fee: 0, outletId: 'pre-order-fulfillment', distance: null, estimate: 'Upon Release' });
            return;
        }

        const selectedAddress = userData?.addresses?.find(a => a.id === selectedAddressId);
        if (selectedAddress?.coordinates?.lat && selectedAddress?.coordinates?.lng && suitableOutlets.length > 0) {
            const customerCoords = { lat: selectedAddress.coordinates.lat, lng: selectedAddress.coordinates.lng };
            const outletsWithDistance = suitableOutlets.map(outlet => ({ ...outlet, distance: calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng)}));
            const sortedOutlets = outletsWithDistance.sort((a, b) => a.distance - b.distance);
            const assignedOutlet = sortedOutlets.find(o => o.distance <= 5) || sortedOutlets[0];

            let fee = (assignedOutlet.distance <= 5) ? 40 : (watchedDistrict || '').toLowerCase().includes('dhaka') ? 60 : 120;
            let estimate = (assignedOutlet.distance <= 5) ? '1-2 Hours (Express)' : (watchedDistrict || '').toLowerCase().includes('dhaka') ? '1-2 Days' : '3-5 Days';
            setShippingInfo({ fee, outletId: assignedOutlet.id, distance: assignedOutlet.distance, estimate });
            return;
        }

        let fee = (watchedDistrict || '').toLowerCase().includes('dhaka') ? 60 : 120;
        let estimate = (watchedDistrict || '').toLowerCase().includes('dhaka') ? '1-2 Days' : '3-5 Days';
        
        let bestOutletId: string | null = suitableOutlets.length > 0 ? suitableOutlets[0].id : null;

        if (!bestOutletId && regularItems.length > 0) {
            setShippingInfo({ fee: 0, outletId: null, distance: null, estimate: 'Unavailable' });
            return;
        }
        setShippingInfo({ fee, outletId: bestOutletId, distance: null, estimate });
    };

    calculateShipping();
  }, [orderMode, pickupOutletId, selectedAddressId, watchedDistrict, cartItems, allProducts, allOutlets, userData, setShippingInfo, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
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

    const finalShippingAddress: ShippingAddress | undefined = orderMode === 'delivery' ? {
        name: values.name, phone: values.phone, division: values.division, district: values.district,
        upazila: values.upazila, area: values.area, streetAddress: values.streetAddress,
    } : undefined;

    const orderId = doc(collection(firestore, 'orders')).id;
    const isPreOrderInCart = cartItems.some(item => item.isPreOrder);
    const assignedOutletId = orderMode === 'pickup' ? pickupOutletId! : shippingInfo.outletId!;
    const pickupCode = orderMode === 'pickup' ? `AZ-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const baseOrderData: Omit<Order, 'status' | 'createdAt' | 'paymentStatus'> = {
        id: orderId, customerId: user.uid, items: cartItems.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
        subtotal: subtotal, discountAmount: discount, promoCode: promoCode ? promoCode.code : undefined, loyaltyPointsUsed: pointsApplied, loyaltyDiscount: pointsDiscount,
        totalAmount: totalPayable, fullOrderValue: fullOrderTotal, orderType: isPreOrderInCart ? 'pre-order' as const : 'regular' as const,
        orderMode: orderMode, pickupOutletId: orderMode === 'pickup' ? pickupOutletId : undefined,
        assignedOutletId: assignedOutletId, pickupCode: pickupCode, shippingAddress: finalShippingAddress
    };

    if (values.paymentMethod === 'cod') {
        try {
            await runTransaction(firestore, async (transaction) => {
                const userRef = doc(firestore, 'users', user.uid);
                
                const regularItems = cartItems.filter(item => !item.isPreOrder);
                let productUpdates: { ref: DocumentReference; data: any }[] = [];
                if (regularItems.length > 0) {
                    const productRefs = regularItems.map(item => doc(firestore, 'products', item.product.id));
                    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                    for (let i = 0; i < regularItems.length; i++) {
                        const item = regularItems[i];
                        const productDoc = productDocs[i];
                        if (!productDoc.exists()) throw new Error(`Product ${item.product.name} not found.`);
                        const productData = productDoc.data() as Product;
                        const variantsArray = Array.isArray(productData.variants) ? JSON.parse(JSON.stringify(productData.variants)) : JSON.parse(JSON.stringify(Object.values(productData.variants)));
                        const variantIndex = variantsArray.findIndex((v: ProductVariant) => v.sku === item.variant.sku);
                        if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found.`);
                        const variant = variantsArray[variantIndex];
                        const currentStock = variant.outlet_stocks?.[assignedOutletId] ?? 0;
                        if (currentStock < item.quantity) throw new Error(`Not enough stock for ${productData.name}.`);
                        variantsArray[variantIndex].stock = (variant.stock || 0) - item.quantity;
                        if (variantsArray[variantIndex].outlet_stocks) variantsArray[variantIndex].outlet_stocks[assignedOutletId] = currentStock - item.quantity;
                        productUpdates.push({ ref: productRefs[i], data: { variants: variantsArray, total_stock: increment(-item.quantity) } });
                    }
                }
                const orderRef = doc(firestore, 'orders', orderId);
                const orderDataForCod: Order = { ...baseOrderData, status: isPreOrderInCart ? 'pre-ordered' : 'new', paymentStatus: 'Unpaid', createdAt: new Date() as any };
                transaction.set(orderRef, orderDataForCod);
                productUpdates.forEach(update => transaction.update(update.ref, update.data));

                if (pointsApplied > 0) {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists() || (userDoc.data().loyaltyPoints || 0) < pointsApplied) {
                        throw new Error("Insufficient loyalty points.");
                    }
                    transaction.update(userRef, { loyaltyPoints: increment(-pointsApplied) });
                    const redeemHistoryRef = doc(collection(firestore, `users/${user.uid}/points_history`));
                    transaction.set(redeemHistoryRef, {
                        userId: user.uid,
                        pointsChange: -pointsApplied,
                        type: 'redeem',
                        reason: `Order: ${orderId}`,
                        createdAt: serverTimestamp(),
                    });
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl">Shipping &amp; Payment</CardTitle>
            </CardHeader>
            
            <FormField
              control={form.control}
              name="paymentMethod" // A field in your schema, but we use it to control the RadioGroup
              render={() => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
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
                </FormItem>
              )}
            />

            {orderMode === 'delivery' ? (
                <div className="space-y-4 pt-4 border-t">
                    {userData?.addresses && userData.addresses.length > 0 && (
                        <div className="space-y-4">
                            <FormLabel>Select a saved address</FormLabel>
                            <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userData.addresses.map(address => (
                                    <FormItem key={address.id}><FormControl>
                                    <Label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                        <RadioGroupItem value={address.id} className="mt-1"/>
                                        <div>
                                            <p className="font-bold text-sm">{address.label} - {address.name}</p>
                                            <p className="text-sm text-muted-foreground">{address.streetAddress}, {address.area}</p>
                                        </div>
                                    </Label>
                                    </FormControl></FormItem>
                                ))}
                            </RadioGroup>
                            <div className="relative flex justify-center text-xs uppercase my-4">
                                <span className="bg-background px-2 text-muted-foreground">OR EDIT/ENTER A NEW ADDRESS</span>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Enter your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="division" render={({ field }) => (<FormItem><FormLabel>Division</FormLabel><FormControl><Input placeholder="e.g., Dhaka" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="e.g., Dhaka" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="upazila" render={({ field }) => (<FormItem><FormLabel>Upazila / Thana</FormLabel><FormControl><Input placeholder="e.g., Gulshan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="area" render={({ field }) => (<FormItem><FormLabel>Area / Post Office</FormLabel><FormControl><Input placeholder="e.g., Banani" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="streetAddress" render={({ field }) => (<FormItem><FormLabel>Street Address / House No.</FormLabel><FormControl><Input placeholder="e.g., House 123, Road 45" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            ) : (
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

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || cartItems.length === 0 || productsLoading || outletsLoading || (orderMode === 'delivery' && !shippingInfo.outletId) || (orderMode === 'pickup' && !pickupOutletId)}>
                {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
        </form>
      </Form>
  );
}
    