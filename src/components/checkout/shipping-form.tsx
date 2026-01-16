
'use client';

import { useState } from 'react';
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
import { collection, doc, writeBatch, serverTimestamp, getDocs, Query } from 'firebase/firestore';
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
  const { items: cartItems, clearCart, total } = useCart(state => ({
    items: state.items,
    clearCart: state.clearCart,
    total: state.items.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0),
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
    
    const isPreOrderCart = cartItems.length > 0 && !!cartItems[0].isPreOrder;


    try {
        if (isPreOrderCart) {
            // Pre-order logic: No stock check needed, just create the order
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
                totalAmount: total,
                assignedOutletId: 'pre-order-fulfillment', // Special value for pre-orders
                status: 'pre-ordered',
                orderType: 'pre-order',
                createdAt: serverTimestamp(),
            });

            await batch.commit();
            
            clearCart();
            toast({
                title: 'Pre-order Placed!',
                description: `Your pre-order has been confirmed. We'll notify you upon release.`,
            });
            router.push('/customer/my-orders');

        } else {
            // Regular order logic with stock check and routing
            const [productsSnapshot, outletsSnapshot] = await Promise.all([
                getDocs(collection(firestore, 'products')),
                getDocs(collection(firestore, 'outlets'))
            ]);
            const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
            const allOutlets = outletsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Outlet[];
            
            const suitableOutlets = allOutlets.filter(outlet => {
                return cartItems.every(cartItem => {
                const product = allProducts.find(p => p.id === cartItem.product.id);
                if (!product) return false;
                const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
                const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
                const stockInOutlet = variant?.outlet_stocks?.[outlet.id] ?? 0;
                return stockInOutlet >= cartItem.quantity;
                });
            });

            if (suitableOutlets.length === 0) {
                toast({ variant: 'destructive', title: 'Out of Stock', description: 'Sorry, no single outlet can fulfill your entire order at the moment.' });
                setIsLoading(false);
                return;
            }

            const customerCoords = { lat: 23.8103, lng: 90.4125 }; 
            
            const nearestOutlet = suitableOutlets.reduce((closest, outlet) => {
                const distance = calculateDistance(
                    customerCoords.lat,
                    customerCoords.lng,
                    outlet.location.lat,
                    outlet.location.lng
                );
                if (!closest || distance < closest.distance) {
                    return { ...outlet, distance };
                }
                return closest;
            }, null as (Outlet & { distance: number }) | null);

            if (!nearestOutlet) {
                toast({ variant: 'destructive', title: 'Routing Error', description: 'Could not find a suitable outlet to ship from.' });
                setIsLoading(false);
                return;
            }

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
                totalAmount: total,
                assignedOutletId: nearestOutlet.id,
                status: 'new',
                orderType: 'regular',
                createdAt: serverTimestamp(),
            });

            for (const cartItem of cartItems) {
                const productRef = doc(firestore, 'products', cartItem.product.id);
                const product = allProducts.find(p => p.id === cartItem.product.id)!;
                const variantsArray = Array.isArray(product.variants) ? [...product.variants] : [...Object.values(product.variants)];
                const variantIndex = variantsArray.findIndex(v => v.sku === cartItem.variant.sku);
                
                if (variantIndex === -1) throw new Error(`Variant ${cartItem.variant.sku} not found during checkout.`);

                const newTotalStock = product.total_stock - cartItem.quantity;
                const newVariantStock = variantsArray[variantIndex].stock - cartItem.quantity;
                const newOutletStock = (variantsArray[variantIndex].outlet_stocks?.[nearestOutlet.id] ?? 0) - cartItem.quantity;

                variantsArray[variantIndex].stock = newVariantStock;
                variantsArray[variantIndex].outlet_stocks = {
                    ...variantsArray[variantIndex].outlet_stocks,
                    [nearestOutlet.id]: newOutletStock
                };

                transaction.update(productRef, {
                    variants: variantsArray,
                    total_stock: newTotalStock,
                });
            }

            await batch.commit();

            clearCart();
            toast({
                title: 'Order Placed!',
                description: `Your order has been routed to our ${nearestOutlet.name} outlet for fulfillment.`,
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
