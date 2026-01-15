
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export function CartSummary() {
  const { items } = useCart();

  const subtotal = items.reduce(
    (acc, item) => {
        if (!item.variant) return acc;
        return acc + item.variant.price * item.quantity;
    },
    0
  );

  const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shippingFee;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-medium">৳{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping Fee</span>
          <span className="font-medium">{shippingFee > 0 ? `৳${shippingFee.toFixed(2)}` : 'Free'}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>৳{total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/checkout" className='w-full'>
          <Button className="w-full" size="lg">Proceed to Checkout</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
