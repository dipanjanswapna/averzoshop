
'use client';

import { useCart } from '@/hooks/use-cart';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
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

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Your Bag is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your bag yet.</p>
        <Link href="/shop">
            <Button className="mt-8">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
        <div className="container mx-auto py-12">
            <div className="mb-8">
                 <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/shop">Shop</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Shopping Bag</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-4">
                    Your Shopping Bag ({items.filter(item => item.variant).length})
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-background p-6 rounded-xl shadow-md">
                    <div className="space-y-6">
                    {items.map((item, index) => (
                        <CartItem key={item.variant?.sku || `${item.product.id}-${index}`} item={item} />
                    ))}
                    </div>
                </div>

                <div className="lg:col-span-1 sticky top-28">
                    <CartSummary />
                </div>
            </div>
        </div>
    </div>
  );
}
