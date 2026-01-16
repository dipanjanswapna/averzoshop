
'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Coupon } from '@/types/coupon';

export function CheckoutOrderSummary() {
  const {
    items,
    subtotal,
    discount,
    promoCode,
    shippingFee,
    totalPayable,
    fullOrderTotal,
    isPartialPayment,
    applyPromoCode,
  } = useCart();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const hasPreOrderItems = useMemo(() => items.some(item => item.isPreOrder), [items]);
  const hasRegularItems = useMemo(() => items.some(item => !item.isPreOrder), [items]);

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim() || !firestore) {
      toast({ variant: 'destructive', title: 'Please enter a promo code.' });
      return;
    }
    if (hasPreOrderItems && !hasRegularItems) {
        toast({ variant: 'destructive', title: 'Promo codes cannot be applied to pre-orders.' });
        return;
    }

    setIsApplying(true);
    try {
      const couponRef = doc(firestore, 'coupons', promoCodeInput.trim().toUpperCase());
      const couponSnap = await getDoc(couponRef);

      if (!couponSnap.exists()) {
        toast({ variant: 'destructive', title: 'Invalid Promo Code' });
        applyPromoCode(null);
        return;
      }

      const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
      
      if (new Date(coupon.expiryDate.seconds * 1000) < new Date()) {
        toast({ variant: 'destructive', title: 'Promo code expired.' });
        applyPromoCode(null);
        return;
      }
      
      applyPromoCode(coupon);
      // The toast for success/failure is now handled within the hook based on applicability

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error applying promo code.' });
    } finally {
      setIsApplying(false);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">
           {hasPreOrderItems && hasRegularItems ? 'Mixed Order Summary' : isPartialPayment ? 'Pre-order Summary' : 'Order Summary'}
        </CardTitle>
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
        
        <div className="space-y-2 text-sm">
             <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">৳{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Discount ({promoCode?.code})</span>
                    <span className="font-medium">- ৳{discount.toFixed(2)}</span>
                </div>
            )}
             <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium">{shippingFee > 0 ? `৳${shippingFee.toFixed(2)}` : 'Free'}</span>
            </div>
        </div>

        <Separator />
        
        {isPartialPayment && (
             <div className="space-y-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                 <div className="flex justify-between font-bold">
                    <span>Total Order Value</span>
                    <span>৳{fullOrderTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                    <span>Payable Now</span>
                    <span>৳{(totalPayable).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Remaining Due</span>
                    <span>৳{(fullOrderTotal - (totalPayable - shippingFee)).toFixed(2)}</span>
                </div>
                 <p className='text-xs text-blue-600 mt-2'>Your cart contains pre-order items. The remaining amount is due upon fulfillment.</p>
            </div>
        )}

        <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
            <label htmlFor="promo-code" className="text-xs font-medium text-muted-foreground">Promo Code</label>
            <Input 
                id="promo-code" 
                placeholder="Enter code" 
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                disabled={isApplying || (hasPreOrderItems && !hasRegularItems)}
            />
            </div>
            <Button onClick={handleApplyPromoCode} disabled={isApplying || (hasPreOrderItems && !hasRegularItems)}>
            {isApplying ? 'Applying...' : 'Apply'}
            </Button>
        </div>
         
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total Payable Today</span>
          <span>৳{totalPayable.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
