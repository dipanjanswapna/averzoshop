
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { CheckoutOrderSummary } from '@/components/checkout/order-summary';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p>Loading checkout...</p>
        </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Your Bag is Empty</h1>
        <p className="mt-2 text-muted-foreground">You can't proceed to checkout with an empty bag.</p>
        <Link href="/shop">
            <Button className="mt-8">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                 <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/cart">Shopping Bag</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Checkout</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-4">
                    Checkout
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="lg:col-span-1 bg-background p-6 rounded-xl shadow-md">
                    <ShippingForm />
                </div>

                <div className="lg:col-span-1 sticky top-32">
                    <CheckoutOrderSummary />
                </div>
            </div>
        </div>
    </div>
  );
}
