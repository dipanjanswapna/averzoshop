
'use client';

import { useState, useMemo } from 'react';
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(11, { message: 'Phone number must be valid.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phone: '', address: '', city: 'Dhaka', paymentMethod: 'cod' },
  });

  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const router = useRouter();


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!firestore || !user || cartItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process order. Please try again.' });
      setIsLoading(false);
      return;
    }
    
    const isPreOrderCart = cartItems.some(item => item.isPreOrder);
    const hasRegularItems = cartItems.some(item => !item.isPreOrder);

    try {
      // Logic for updating user points
      const pointsEarned = Math.floor(totalPayable / 100) * 5;
      const userRef = doc(firestore, 'users', user.uid);

      if (isPreOrderCart && !hasRegularItems) { // Only pre-order items
          const batch = writeBatch(firestore);
          const orderRef = doc(collection(firestore, 'orders'));
          
          batch.set(orderRef, {
              customerId: user.uid,
              shippingAddress: values,
              items: cartItems.map(item => ({
                  productId: item.product.id,
                  productName: item.product.name,
                  variantSku: item.variant.sku,
                  quantity: item.quantity,
                  price: item.variant.price
              })),
              subtotal: subtotal,
              totalAmount: totalPayable,
              fullOrderValue: fullOrderTotal,
              assignedOutletId: 'pre-order-fulfillment', 
              status: 'pre-ordered',
              orderType: 'pre-order',
              createdAt: serverTimestamp(),
          });
          
          batch.update(userRef, { 
              loyaltyPoints: increment(pointsEarned),
              totalSpent: increment(totalPayable) 
          });
          const pointsHistoryRef = doc(collection(firestore, `users/${user.uid}/points_history`));
          batch.set(pointsHistoryRef, {
              userId: user.uid,
              pointsChange: pointsEarned,
              type: 'earn',
              reason: `Online Pre-order: ${orderRef.id}`,
              createdAt: serverTimestamp(),
          });

          await batch.commit();
          
          clearCart();
          toast({
              title: 'Pre-order Placed!',
              description: `Your pre-order has been confirmed. We'll notify you upon release.`,
          });
          router.push('/customer/my-orders');

      } else { // Mixed or regular cart
          await runTransaction(firestore, async (transaction) => {
            const orderRef = doc(collection(firestore, 'orders'));
            
            // Only process regular items for stock check and update
            const regularItems = cartItems.filter(item => !item.isPreOrder);
            if (regularItems.length > 0) {
                const [productsSnapshot, outletsSnapshot] = await Promise.all([
                    getDocs(collection(firestore, 'products')),
                    getDocs(collection(firestore, 'outlets'))
                ]);
                const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
                const allOutlets = outletsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Outlet[];

                const suitableOutlets = allOutlets.filter(outlet => {
                    return regularItems.every(cartItem => {
                        const product = allProducts.find(p => p.id === cartItem.product.id);
                        if (!product) return false;
                        const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
                        const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
                        const stockInOutlet = variant?.outlet_stocks?.[outlet.id] ?? 0;
                        return stockInOutlet >= cartItem.quantity;
                    });
                });

                if (suitableOutlets.length === 0) {
                  throw new Error('Sorry, no single outlet can fulfill your entire order at the moment.');
                }
                
                const customerCoords = { lat: 23.8103, lng: 90.4125 };
                const nearestOutlet = suitableOutlets.reduce((closest, outlet) => {
                    const distance = calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng);
                    if (!closest || distance < closest.distance) return { ...outlet, distance };
                    return closest;
                }, null as (Outlet & { distance: number }) | null);
    
                if (!nearestOutlet) {
                    throw new Error('Could not find a suitable outlet to ship from.');
                }
                
                for (const cartItem of regularItems) {
                    const productRef = doc(firestore, 'products', cartItem.product.id);
                    const productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) throw new Error(`Product ${cartItem.product.name} not found.`);

                    const productData = productDoc.data() as Product;
                    const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : Object.values(productData.variants || {});
                    
                    const variantIndex = variantsArray.findIndex(v => v.sku === cartItem.variant.sku);
                    if (variantIndex === -1) throw new Error(`Variant ${cartItem.variant.sku} not found.`);

                    const variant = variantsArray[variantIndex];
                    const currentStock = variant.outlet_stocks?.[nearestOutlet.id] ?? 0;
                    if (currentStock < cartItem.quantity) throw new Error(`Not enough stock for ${productData.name} at ${nearestOutlet.name}.`);

                    variantsArray[variantIndex].stock = (variant.stock || 0) - cartItem.quantity;
                    variantsArray[variantIndex].outlet_stocks![nearestOutlet.id] = currentStock - cartItem.quantity;
                    
                    const newTotalStock = productData.total_stock - cartItem.quantity;

                    transaction.update(productRef, {
                        variants: variantsArray,
                        total_stock: newTotalStock
                    });
                }

                 transaction.set(orderRef, {
                    customerId: user.uid,
                    shippingAddress: values,
                    items: cartItems.map(item => ({
                        productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price
                    })),
                    subtotal: subtotal,
                    discountAmount: discount,
                    promoCode: promoCode?.code,
                    totalAmount: totalPayable,
                    fullOrderValue: fullOrderTotal,
                    assignedOutletId: nearestOutlet.id,
                    status: isPreOrderCart ? 'pre-ordered' : 'new',
                    orderType: isPreOrderCart ? 'pre-order' : 'regular',
                    createdAt: serverTimestamp(),
                });
            } else { // Only pre-order items but in the else block
                 transaction.set(orderRef, {
                    customerId: user.uid,
                    shippingAddress: values,
                    items: cartItems.map(item => ({
                        productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price
                    })),
                    subtotal: subtotal,
                    totalAmount: totalPayable,
                    fullOrderValue: fullOrderTotal,
                    assignedOutletId: 'pre-order-fulfillment', 
                    status: 'pre-ordered',
                    orderType: 'pre-order',
                    createdAt: serverTimestamp(),
                });
            }

            transaction.update(userRef, { 
                loyaltyPoints: increment(pointsEarned),
                totalSpent: increment(totalPayable) 
            });
            const pointsHistoryRef = doc(collection(firestore, `users/${user.uid}/points_history`));
            transaction.set(pointsHistoryRef, {
                userId: user.uid,
                pointsChange: pointsEarned,
                type: 'earn',
                reason: `Online Order: ${orderRef.id}`,
                createdAt: serverTimestamp(),
            });
          });

          clearCart();
          toast({
              title: 'Order Placed!',
              description: `Your order has been confirmed.`,
          });
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardHeader className="p-0 mb-6">
                <CardTitle className="font-headline text-xl">Shipping Information</CardTitle>
            </CardHeader>
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Input placeholder="House, Road, Area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Select your city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="cod" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Cash on Delivery
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="online" disabled />
                      </FormControl>
                      <FormLabel className="font-normal text-muted-foreground">
                        Online Payment (Coming Soon)
                      </FormLabel>
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

    
