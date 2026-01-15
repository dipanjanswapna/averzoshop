
'use client';

import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export function CheckoutOrderSummary() {
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
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {items.map((item, index) => {
            if (!item.variant) return null;
            return (
              <div key={item.variant.sku || index} className="flex items-center gap-4 text-sm">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                       <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                      </div>
                  </div>
                <div className="flex-1">
                  <p className="font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">৳{item.variant.price.toFixed(2)}</p>
                </div>
                <p className="font-bold">৳{(item.variant.price * item.quantity).toFixed(2)}</p>
              </div>
            )
          })}
        </div>
        <Separator />
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
    </Card>
  );
}
