'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Order } from '@/types/order';
import { OrderTracker } from '@/components/order/order-tracker';
import Image from 'next/image';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { firestore } = useFirebase();

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !firestore) {
      setError('Please enter a valid Order ID.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOrder(null);
    try {
      const orderRef = doc(firestore, 'orders', orderId.trim());
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
      } else {
        setError('No order found with this ID. Please check the ID and try again.');
      }
    } catch (err) {
      setError('An error occurred while fetching your order. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">Enter your order ID below to see its current status.</p>
      </div>

      <div className="max-w-lg mx-auto">
        <form onSubmit={handleTrackOrder} className="flex items-center gap-2">
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order ID (e.g., aBCd1234)..."
            className="h-12 text-base"
          />
          <Button type="submit" size="lg" className="h-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span className="sr-only">Track</span>
          </Button>
        </form>
        {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
      </div>

      {order && (
        <Card className="mt-12 shadow-lg">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Order ID: <span className="font-mono">{order.id}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="font-bold mb-4">Order Status</h3>
              <OrderTracker status={order.status} orderType={order.orderType} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
              <div>
                <h3 className="font-bold mb-2">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.streetAddress}, {order.shippingAddress.area}</p>
                  <p>{order.shippingAddress.upazila}, {order.shippingAddress.district}</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
               <div>
                <h3 className="font-bold mb-2">Order Summary</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>৳{(order.subtotal ?? order.totalAmount).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span>- ৳{order.discountAmount?.toFixed(2) ?? '0.00'}</span></div>
                    <div className="flex justify-between font-bold text-foreground border-t pt-1 mt-1"><span>Total:</span> <span>৳{order.totalAmount.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 pt-6 border-t">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.variantSku} className="flex items-center gap-4">
                     <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                       {/* You might need a way to fetch product image */}
                       <Image src="https://placehold.co/100" alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.variantSku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.quantity} x ৳{item.price.toFixed(2)}</p>
                      <p className="text-sm font-bold">৳{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
