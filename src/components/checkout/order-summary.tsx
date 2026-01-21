'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Coupon } from '@/types/coupon';
import { Award, XCircle } from 'lucide-react';
import { Label } from '../ui/label';

export function CheckoutOrderSummary() {
  const { 
    items, discount, promoCode, pointsApplied, pointsDiscount, shippingInfo, totalPayable,
    regularItemsSubtotal, preOrderItemsSubtotal, preOrderDepositPayable,
    cardPromoDiscountAmount
  } = useCart(state => ({
    items: state.items,
    discount: state.discount,
    promoCode: state.promoCode,
    pointsApplied: state.pointsApplied,
    pointsDiscount: state.pointsDiscount,
    shippingInfo: state.shippingInfo,
    totalPayable: state.totalPayable,
    regularItemsSubtotal: state.regularItemsSubtotal,
    preOrderItemsSubtotal: state.preOrderItemsSubtotal,
    preOrderDepositPayable: state.preOrderDepositPayable,
    cardPromoDiscountAmount: state.cardPromoDiscountAmount,
  }));

  const applyPromoCode = useCart(state => state.applyPromoCode);
  const applyPoints = useCart(state => state.applyPoints);
  const removePoints = useCart(state => state.removePoints);
  const applyCardPromo = useCart(state => state.applyCardPromo);
  
  const { userData } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  const [pointsToUseInput, setPointsToUseInput] = useState('');
  const [potentialPointsDiscount, setPotentialPointsDiscount] = useState(0);

  const pointValue = 0.20; // 1 point = 0.20 BDT
  const availablePoints = userData?.loyaltyPoints || 0;

  const hasPreOrderItems = useMemo(() => items.some(item => item.isPreOrder), [items]);
  const hasRegularItems = useMemo(() => items.some(item => !item.isPreOrder), [items]);
  
  useEffect(() => {
    applyCardPromo(userData);
    // This effect runs when the user data changes, ensuring the card promo is applied/removed.
  }, [userData, applyCardPromo]);

  const { maxPointsForOrder, maxDiscountFromPoints } = useMemo(() => {
    const maxDiscount = regularItemsSubtotal - cardPromoDiscountAmount - discount + preOrderDepositPayable;
    const maxPoints = Math.floor(Math.max(0, maxDiscount) / pointValue);
    const usablePoints = Math.min(maxPoints, availablePoints);
    const discountValue = usablePoints * pointValue;
    return { maxPointsForOrder: usablePoints, maxDiscountFromPoints: discountValue };
  }, [regularItemsSubtotal, cardPromoDiscountAmount, discount, preOrderDepositPayable, availablePoints, pointValue]);

  useEffect(() => {
      const pointsNum = parseInt(pointsToUseInput, 10);
      if (!isNaN(pointsNum) && pointsNum > 0) {
          const discountValue = Math.min(pointsNum, maxPointsForOrder) * pointValue;
          setPotentialPointsDiscount(discountValue);
      } else {
          setPotentialPointsDiscount(0);
      }
  }, [pointsToUseInput, maxPointsForOrder, pointValue]);

  const handleApplyMaxPoints = () => {
    setPointsToUseInput(String(maxPointsForOrder));
  };


  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim() || !firestore) {
      toast({ variant: 'destructive', title: 'Please enter a promo code.' });
      return;
    }
    if (!hasRegularItems) {
        toast({ variant: 'destructive', title: 'Promo codes can only be applied to regular items.' });
        return;
    }

    setIsApplyingPromo(true);
    try {
      const code = promoCodeInput.trim().toUpperCase();
      const couponsRef = collection(firestore, 'coupons');
      const q = query(couponsRef, where("code", "==", code), limit(1));
      const couponQuerySnap = await getDocs(q);

      if (couponQuerySnap.empty) {
        toast({ variant: 'destructive', title: 'Invalid Promo Code' });
        applyPromoCode(null);
        setIsApplyingPromo(false);
        return;
      }
      
      const couponDoc = couponQuerySnap.docs[0];
      const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
      
      if (new Date(coupon.expiryDate.seconds * 1000) < new Date()) {
        toast({ variant: 'destructive', title: 'Promo code expired.' });
        applyPromoCode(null);
        setIsApplyingPromo(false);
        return;
      }
      
      applyPromoCode(coupon);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error applying promo code.' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleApplyPoints = () => {
    const pointsNum = parseInt(pointsToUseInput, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid number of points.' });
      return;
    }
    applyPoints(pointsNum, availablePoints, pointValue);
    setPointsToUseInput('');
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">
           Order Summary
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
                      {item.isPreOrder && <div className="absolute bottom-0 left-0 right-0 bg-purple-600/80 text-white text-center text-[9px] font-bold uppercase py-0.5">Pre-order</div>}
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
            {hasRegularItems && (
              <div className="space-y-2 py-2">
                <p className="font-bold text-muted-foreground">Regular Items</p>
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>৳{regularItemsSubtotal.toFixed(2)}</span>
                </div>
                {cardPromoDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span className="font-medium">Card Promo ({userData?.cardPromoDiscount}%)</span>
                        <span>- ৳{cardPromoDiscountAmount.toFixed(2)}</span>
                    </div>
                )}
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span className="font-medium">Coupon ({promoCode?.code})</span>
                        <span>- ৳{discount.toFixed(2)}</span>
                    </div>
                )}
                 <div className="flex justify-between font-medium border-t pt-2 mt-1">
                    <span>Payable for regular items</span>
                    <span>৳{(regularItemsSubtotal - cardPromoDiscountAmount - discount).toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {hasPreOrderItems && hasRegularItems && <Separator />}

            {hasPreOrderItems && (
              <div className="space-y-2 py-2">
                 <p className="font-bold text-muted-foreground">Pre-order Items</p>
                <div className="flex justify-between">
                    <span>Total Value</span>
                    <span>৳{preOrderItemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-primary border-t pt-2 mt-1">
                    <span>Deposit Payable Now</span>
                    <span>৳{preOrderDepositPayable.toFixed(2)}</span>
                </div>
                 <p className='text-xs text-blue-600 mt-2'>The remaining amount for pre-orders is due upon fulfillment.</p>
              </div>
            )}
        </div>

        <Separator />
        
        <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Promo Code</Label>
            <div className="flex items-end gap-2">
                <Input 
                    id="promo-code" 
                    placeholder="Enter code" 
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    disabled={isApplyingPromo || !hasRegularItems}
                />
                <Button onClick={handleApplyPromoCode} disabled={isApplyingPromo || !promoCodeInput || !hasRegularItems}>
                {isApplyingPromo ? 'Applying...' : 'Apply'}
                </Button>
            </div>
        </div>

        {userData && availablePoints > 0 && (
            <div className="space-y-3 pt-4 border-t">
                <Label className="font-bold flex items-center gap-2"><Award size={16} className="text-primary" /> Use Loyalty Points</Label>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground">You have <span className="font-bold text-primary">{availablePoints}</span> points (worth ৳{(availablePoints * pointValue).toFixed(2)})</p>
                    {pointsApplied > 0 ? (
                         <div className="flex justify-between items-center bg-green-100/50 p-2 rounded-md">
                            <div className="text-green-700">
                                <p className="text-sm font-bold">Points Applied: {pointsApplied}</p>
                                <p className="text-xs">-৳{pointsDiscount.toFixed(2)}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={removePoints}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <Input
                                placeholder="Points to use"
                                type="number"
                                value={pointsToUseInput}
                                onChange={(e) => setPointsToUseInput(e.target.value)}
                            />
                            <Button onClick={handleApplyPoints}>Apply</Button>
                        </div>
                         {potentialPointsDiscount > 0 && (
                            <p className="text-xs text-center text-muted-foreground">Will apply a discount of ~৳{potentialPointsDiscount.toFixed(2)}</p>
                        )}
                        {maxPointsForOrder > 0 && (
                            <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs w-full" onClick={handleApplyMaxPoints}>
                                Use maximum ({maxPointsForOrder} pts for ৳{maxDiscountFromPoints.toFixed(2)})
                            </Button>
                        )}
                       </div>
                    )}
                </div>
            </div>
        )}
         
        <Separator />
        <div className="space-y-2 text-sm">
            {pointsDiscount > 0 && (
                 <div className="flex justify-between text-green-600">
                    <span className="font-medium">Loyalty Points</span>
                    <span>- ৳{pointsDiscount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium">{shippingInfo.fee > 0 ? `৳${shippingInfo.fee.toFixed(2)}` : 'Free'}</span>
            </div>
             {shippingInfo.estimate && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Estimated Delivery</span>
                    <span>{shippingInfo.estimate}</span>
                </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Payable Today</span>
              <span>৳{totalPayable.toFixed(2)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    