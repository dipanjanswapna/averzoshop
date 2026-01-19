
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
import { collection, doc, setDoc, runTransaction, increment } from 'firebase/firestore';
import { calculateDistance } from '@/lib/distance';
import type { Outlet } from '@/types/outlet';
import type { Product } from '@/types/product';
import { useRouter } from 'next/navigation';
import type { Order, ShippingAddress } from '@/types/order';
import { Label } from '../ui/label';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { createSslCommerzSession } from '@/actions/payment-actions';

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
  const { cartItems, clearCart, totalPayable, subtotal, fullOrderTotal, promoCode, discount, setShippingInfo, shippingInfo } = useCart(state => ({
    cartItems: state.items,
    clearCart: state.clearCart,
    totalPayable: state.totalPayable,
    subtotal: state.subtotal,
    fullOrderTotal: state.fullOrderTotal,
    promoCode: state.promoCode,
    discount: state.discount,
    setShippingInfo: state.setShippingInfo,
    shippingInfo: state.shippingInfo,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

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
    if (selectedAddressId && userData?.addresses) {
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
  }, [selectedAddressId, userData, form]);

  useEffect(() => {
    const calculateShipping = () => {
        const regularItems = cartItems.filter(item => !item.isPreOrder);

        if (regularItems.length === 0) {
            const estimate = cartItems.length > 0 ? 'Upon Release' : null;
            setShippingInfo({ fee: 0, outletId: 'pre-order-fulfillment', distance: null, estimate });
            return;
        }

        if (!allOutlets || !allProducts) {
            return;
        }
        
        const suitableOutlets = allOutlets.filter(outlet => regularItems.every(cartItem => {
            const product = allProducts.find(p => p.id === cartItem.product.id);
            if (!product) return false;
            const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
            const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
            return (variant?.outlet_stocks?.[outlet.id] ?? 0) >= cartItem.quantity;
        }));

        const selectedAddress = userData?.addresses?.find(a => a.id === selectedAddressId);
        if (selectedAddress?.coordinates?.lat && selectedAddress?.coordinates?.lng && suitableOutlets.length > 0) {
            const customerCoords = { lat: selectedAddress.coordinates.lat, lng: selectedAddress.coordinates.lng };
            
            const outletsWithDistance = suitableOutlets.map(outlet => ({
                ...outlet,
                distance: calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng),
            }));
        
            const sortedOutlets = outletsWithDistance.sort((a, b) => a.distance - b.distance);
            const assignedOutlet = sortedOutlets.find(o => o.distance <= 5) || sortedOutlets[0];

            let fee = 0;
            let estimate = '';
            if (assignedOutlet.distance <= 5) {
                fee = 40;
                estimate = '1-2 Hours (Express)';
            } else if ((watchedDistrict || '').toLowerCase().includes('dhaka')) {
                fee = 60;
                estimate = '1-2 Days';
            } else {
                fee = 120;
                estimate = '3-5 Days';
            }
            setShippingInfo({ fee, outletId: assignedOutlet.id, distance: assignedOutlet.distance, estimate });
            return;
        }

        // Fallback to district-based calculation
        let fee = 0;
        let estimate = '';
        const district = (watchedDistrict || '').toLowerCase();

        if (district.includes('dhaka')) {
            fee = 60;
            estimate = '1-2 Days';
        } else if (district) { 
            fee = 120;
            estimate = '3-5 Days';
        } else { 
            fee = 60; // Default
            estimate = '2-4 Days';
        }

        let bestOutletId: string | null = null;
        if (suitableOutlets.length > 0) {
            bestOutletId = suitableOutlets[0].id;
        }

        if (!bestOutletId && regularItems.length > 0) {
            toast({ variant: 'destructive', title: 'No Fulfillment Outlet', description: 'Sorry, no single outlet can fulfill your entire order at the moment.' });
            setShippingInfo({ fee: 0, outletId: null, distance: null, estimate: 'Unavailable' });
            return;
        }

        setShippingInfo({ fee, outletId: bestOutletId, distance: null, estimate });
    };

    calculateShipping();
  }, [selectedAddressId, watchedDistrict, cartItems, allProducts, allOutlets, userData, setShippingInfo, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!firestore || !user || !userData || cartItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process order. Please try again.' });
      setIsLoading(false);
      return;
    }
    
    if (!shippingInfo.outletId && cartItems.some(item => !item.isPreOrder)) {
        toast({ variant: 'destructive', title: 'Cannot Place Order', description: 'We could not find a suitable outlet to fulfill your order.' });
        setIsLoading(false);
        return;
    }

    const finalShippingAddress: ShippingAddress = {
        name: values.name,
        phone: values.phone,
        division: values.division,
        district: values.district,
        upazila: values.upazila,
        area: values.area,
        streetAddress: values.streetAddress,
    };

    const orderId = doc(collection(firestore, 'orders')).id;
    const isPreOrderInCart = cartItems.some(item => item.isPreOrder);
    const assignedOutletId = shippingInfo.outletId!;

    const baseOrderData = {
        id: orderId,
        customerId: user.uid,
        shippingAddress: finalShippingAddress,
        items: cartItems.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
        subtotal: subtotal,
        discountAmount: discount,
        promoCode: promoCode?.code,
        totalAmount: totalPayable,
        fullOrderValue: fullOrderTotal,
        assignedOutletId: assignedOutletId,
        orderType: isPreOrderInCart ? 'pre-order' as const : 'regular' as const,
        createdAt: new Date(), // Use JS Date for server action, will be converted later
    };

    if (values.paymentMethod === 'cod') {
        try {
            await runTransaction(firestore, async (transaction) => {
                const orderRef = doc(firestore, 'orders', orderId);
                const userRef = doc(firestore, 'users', user.uid);

                const orderDataForCod: Order = {
                    ...baseOrderData,
                    status: isPreOrderInCart ? 'pre-ordered' : 'new',
                    paymentStatus: 'Unpaid',
                    createdAt: new Date() as any, // Firestore will convert this
                };
                transaction.set(orderRef, orderDataForCod);

                const regularItems = cartItems.filter(item => !item.isPreOrder);
                if (regularItems.length > 0 && assignedOutletId) {
                    const productIds = [...new Set(regularItems.map(item => item.product.id))];
                    const productRefs = productIds.map(id => doc(firestore, 'products', id));
                    const productDocs = await transaction.getAll(...productRefs);
                    const productMap = new Map(productDocs.map(d => [d.id, d.data() as Product]));
                    
                    for (const cartItem of regularItems) {
                        const product = productMap.get(cartItem.product.id);
                        if (!product) throw new Error(`Product ${cartItem.product.name} not found.`);
                        
                        const variantsArray = Array.isArray(product.variants) ? JSON.parse(JSON.stringify(product.variants)) : JSON.parse(JSON.stringify(Object.values(product.variants)));
                        const variantIndex = variantsArray.findIndex((v: ProductVariant) => v.sku === cartItem.variant.sku);
                        if (variantIndex === -1) throw new Error(`Variant ${cartItem.variant.sku} not found.`);
                        
                        const variant = variantsArray[variantIndex];
                        const currentStock = variant.outlet_stocks?.[assignedOutletId] ?? 0;
                        if (currentStock < cartItem.quantity) throw new Error(`Not enough stock for ${product.name}.`);

                        variantsArray[variantIndex].stock = (variant.stock || 0) - cartItem.quantity;
                        if (variantsArray[variantIndex].outlet_stocks) {
                            variantsArray[variantIndex].outlet_stocks[assignedOutletId] = currentStock - cartItem.quantity;
                        }
                        
                        transaction.update(productRefs.find(r => r.id === product.id)!, {
                            variants: variantsArray,
                            total_stock: increment(-cartItem.quantity),
                        });
                    }
                }

                const pointsEarned = Math.floor(totalPayable / 100) * 5;
                if (pointsEarned > 0) {
                    transaction.update(userRef, { loyaltyPoints: increment(pointsEarned), totalSpent: increment(totalPayable) });
                    const pointsHistoryRef = doc(collection(firestore, `users/${user.uid}/points_history`));
                    transaction.set(pointsHistoryRef, { userId: user.uid, pointsChange: pointsEarned, type: 'earn', reason: `Online Order: ${orderId}`, createdAt: new Date() });
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
            const orderDataForOnline: Order = {
                ...baseOrderData,
                status: 'pending_payment',
                paymentStatus: 'Unpaid',
            } as Order;

            const orderRef = doc(firestore, 'orders', orderId);
            await setDoc(orderRef, orderDataForOnline);

            const session = await createSslCommerzSession(orderDataForOnline, userData);

            if (session.redirectUrl) {
                window.location.href = session.redirectUrl;
            } else {
                throw new Error("Could not get payment URL from gateway.");
            }
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
                <CardTitle className="font-headline text-xl">Shipping Information</CardTitle>
            </CardHeader>
            
            {userData?.addresses && userData.addresses.length > 0 && (
            <div className="space-y-4">
                <FormLabel>Select a saved address</FormLabel>
                <RadioGroup
                    value={selectedAddressId || ''}
                    onValueChange={setSelectedAddressId}
                    className="grid grid-cols-1 gap-4"
                >
                {userData.addresses.map(address => (
                    <FormItem key={address.id}>
                    <FormControl>
                        <Label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                        <RadioGroupItem value={address.id} className="mt-1"/>
                        <div>
                            <p className="font-bold">{address.label} - {address.name}</p>
                            <p className="text-sm text-muted-foreground">{address.streetAddress}, {address.area}</p>
                            <p className="text-sm text-muted-foreground">{address.upazila}, {address.district}</p>
                        </div>
                        </Label>
                    </FormControl>
                    </FormItem>
                ))}
                </RadioGroup>
                <div className="relative flex justify-center text-xs uppercase my-4">
                    <span className="bg-background px-2 text-muted-foreground">OR EDIT/ENTER A NEW ADDRESS BELOW</span>
                </div>
            </div>
            )}
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Enter your phone number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="division" render={({ field }) => (
                    <FormItem><FormLabel>Division</FormLabel><FormControl><Input placeholder="e.g., Dhaka" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="e.g., Dhaka" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="upazila" render={({ field }) => (
                    <FormItem><FormLabel>Upazila / Thana</FormLabel><FormControl><Input placeholder="e.g., Gulshan" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem><FormLabel>Area / Post Office</FormLabel><FormControl><Input placeholder="e.g., Banani" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <FormField control={form.control} name="streetAddress" render={({ field }) => (
                <FormItem><FormLabel>Street Address / House No.</FormLabel><FormControl><Input placeholder="e.g., House 123, Road 45" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

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
                        <FormLabel className="font-normal">Cash on Delivery</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="online" /></FormControl>
                        <FormLabel className="font-normal">Online Payment</FormLabel>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || cartItems.length === 0 || productsLoading || outletsLoading || (!shippingInfo.outletId && cartItems.some(i => !i.isPreOrder))}>
                {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
        </form>
      </Form>
  );
}
