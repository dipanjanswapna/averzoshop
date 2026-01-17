
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
import { useCart, CartItem as CartItemType } from '@/hooks/use-cart';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, doc, writeBatch, serverTimestamp, getDocs, runTransaction, increment } from 'firebase/firestore';
import { calculateDistance } from '@/lib/distance';
import type { Outlet } from '@/types/outlet';
import type { Product } from '@/types/product';
import { useRouter } from 'next/navigation';
import type { ShippingAddress } from '@/types/order';
import { Label } from '../ui/label';

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
  const { cartItems, clearCart, totalPayable, subtotal, fullOrderTotal, isPartialPayment, promoCode, discount } = useCart(state => ({
    cartItems: state.items,
    clearCart: state.clearCart,
    totalPayable: state.totalPayable,
    subtotal: state.subtotal,
    fullOrderTotal: state.fullOrderTotal,
    isPartialPayment: state.isPartialPayment,
    promoCode: state.promoCode,
    discount: state.discount,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

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


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!firestore || !user || cartItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process order. Please try again.' });
      setIsLoading(false);
      return;
    }
    
    const isPreOrderCart = cartItems.some(item => item.isPreOrder);
    const hasRegularItems = cartItems.some(item => !item.isPreOrder);
    
    const finalShippingAddress: ShippingAddress = {
        name: values.name,
        phone: values.phone,
        division: values.division,
        district: values.district,
        upazila: values.upazila,
        area: values.area,
        streetAddress: values.streetAddress,
    };

    try {
      const pointsEarned = Math.floor(totalPayable / 100) * 5;
      const userRef = doc(firestore, 'users', user.uid);

      if (isPreOrderCart && !hasRegularItems) {
          const batch = writeBatch(firestore);
          const orderRef = doc(collection(firestore, 'orders'));
          
          batch.set(orderRef, {
              customerId: user.uid,
              shippingAddress: finalShippingAddress,
              items: cartItems.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
              subtotal: subtotal,
              totalAmount: totalPayable,
              fullOrderValue: fullOrderTotal,
              assignedOutletId: 'pre-order-fulfillment', 
              status: 'pre-ordered',
              orderType: 'pre-order',
              createdAt: serverTimestamp(),
          });
          
          batch.update(userRef, { loyaltyPoints: increment(pointsEarned), totalSpent: increment(totalPayable) });
          const pointsHistoryRef = doc(collection(firestore, `users/${user.uid}/points_history`));
          batch.set(pointsHistoryRef, { userId: user.uid, pointsChange: pointsEarned, type: 'earn', reason: `Online Pre-order: ${orderRef.id}`, createdAt: serverTimestamp() });
          await batch.commit();
          
          clearCart();
          toast({ title: 'Pre-order Placed!', description: `Your pre-order has been confirmed. We'll notify you upon release.` });
          router.push('/customer/my-orders');

      } else {
          await runTransaction(firestore, async (transaction) => {
            const orderRef = doc(collection(firestore, 'orders'));
            
            const regularItems = cartItems.filter(item => !item.isPreOrder);
            if (regularItems.length > 0) {
                const [productsSnapshot, outletsSnapshot] = await Promise.all([
                    getDocs(collection(firestore, 'products')),
                    getDocs(collection(firestore, 'outlets'))
                ]);
                const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
                const allOutlets = outletsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Outlet[];

                const suitableOutlets = allOutlets.filter(outlet => regularItems.every(cartItem => {
                    const product = allProducts.find(p => p.id === cartItem.product.id);
                    if (!product) return false;
                    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
                    const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
                    return (variant?.outlet_stocks?.[outlet.id] ?? 0) >= cartItem.quantity;
                }));

                if (suitableOutlets.length === 0) throw new Error('Sorry, no single outlet can fulfill your entire order.');
                
                const selectedAddress = userData?.addresses?.find(a => a.id === selectedAddressId);
                const customerCoords = selectedAddress?.coordinates?.lat && selectedAddress?.coordinates?.lng 
                    ? { lat: selectedAddress.coordinates.lat, lng: selectedAddress.coordinates.lng } 
                    : { lat: 23.8103, lng: 90.4125 }; // Fallback to Dhaka center
                
                const outletsWithDistance = suitableOutlets.map(outlet => ({
                    ...outlet,
                    distance: calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng),
                }));
            
                const sortedOutlets = outletsWithDistance.sort((a, b) => a.distance - b.distance);
                
                // As per the prompt, prioritize outlets within a 5km range for express delivery.
                const hyperlocalOutlet = sortedOutlets.find(o => o.distance <= 5); 
                
                // Fallback to the absolute nearest outlet if no hyperlocal option is available.
                const assignedOutlet = hyperlocalOutlet || sortedOutlets[0];

                if (!assignedOutlet) throw new Error('Could not find a suitable outlet.');
    
                for (const cartItem of regularItems) {
                    const productRef = doc(firestore, 'products', cartItem.product.id);
                    const productDoc = await transaction.get(productRef);
                    if (!productDoc.exists()) throw new Error(`Product ${cartItem.product.name} not found.`);

                    const productData = productDoc.data() as Product;
                    const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : Object.values(productData.variants || {});
                    const variantIndex = variantsArray.findIndex(v => v.sku === cartItem.variant.sku);
                    if (variantIndex === -1) throw new Error(`Variant ${cartItem.variant.sku} not found.`);

                    const variant = variantsArray[variantIndex];
                    const currentStock = variant.outlet_stocks?.[assignedOutlet.id] ?? 0;
                    if (currentStock < cartItem.quantity) throw new Error(`Not enough stock for ${productData.name}.`);

                    variantsArray[variantIndex].stock = (variant.stock || 0) - cartItem.quantity;
                    variantsArray[variantIndex].outlet_stocks![assignedOutlet.id] = currentStock - cartItem.quantity;
                    const newTotalStock = productData.total_stock - cartItem.quantity;
                    transaction.update(productRef, { variants: variantsArray, total_stock: newTotalStock });
                }

                transaction.set(orderRef, {
                    customerId: user.uid,
                    shippingAddress: finalShippingAddress,
                    items: cartItems.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
                    subtotal: subtotal,
                    discountAmount: discount,
                    promoCode: promoCode?.code,
                    totalAmount: totalPayable,
                    fullOrderValue: fullOrderTotal,
                    assignedOutletId: assignedOutlet.id,
                    status: isPreOrderCart ? 'pre-ordered' : 'new',
                    orderType: isPreOrderCart ? 'pre-order' : 'regular',
                    createdAt: serverTimestamp(),
                });
            } else {
                 transaction.set(orderRef, {
                    customerId: user.uid,
                    shippingAddress: finalShippingAddress,
                    items: cartItems.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
                    subtotal: subtotal,
                    totalAmount: totalPayable,
                    fullOrderValue: fullOrderTotal,
                    assignedOutletId: 'pre-order-fulfillment', 
                    status: 'pre-ordered',
                    orderType: 'pre-order',
                    createdAt: serverTimestamp(),
                });
            }

            transaction.update(userRef, { loyaltyPoints: increment(pointsEarned), totalSpent: increment(totalPayable) });
            const pointsHistoryRef = doc(collection(firestore, `users/${user.uid}/points_history`));
            transaction.set(pointsHistoryRef, { userId: user.uid, pointsChange: pointsEarned, type: 'earn', reason: `Online Order: ${orderRef.id}`, createdAt: serverTimestamp() });
          });

          clearCart();
          toast({ title: 'Order Placed!', description: `Your order has been confirmed.` });
          router.push('/customer/my-orders');
        }
    } catch (error: any) {
      console.error("Order placement failed:", error);
      toast({ variant: 'destructive', title: 'Order Failed', description: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
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
                        <FormControl><RadioGroupItem value="online" disabled /></FormControl>
                        <FormLabel className="font-normal text-muted-foreground">Online Payment (Coming Soon)</FormLabel>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || cartItems.length === 0}>
                {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
        </form>
      </Form>
  );
}
