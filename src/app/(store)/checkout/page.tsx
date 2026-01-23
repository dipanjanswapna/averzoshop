'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, Loader2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && !user) {
      router.replace('/welcome?redirect=/checkout');
    }
  }, [isMounted, authLoading, user, router]);

  if (!isMounted || authLoading || !user) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
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

            <div className="flex flex-col lg:flex-row items-start gap-12">
                <div className="flex-1 w-full bg-background p-6 rounded-xl shadow-md">
                    <ShippingForm />
                </div>

                <div className="w-full lg:w-[420px] lg:sticky top-32">
                    <CheckoutOrderSummary />
                </div>
            </div>
        </div>
    </div>
  );
}
