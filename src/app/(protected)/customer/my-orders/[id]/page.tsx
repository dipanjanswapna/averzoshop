'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestoreDoc, useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Order, OrderStatus } from '@/types/order';
import type { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Package, Printer } from 'lucide-react';
import Image from 'next/image';
import { OrderTracker } from '@/components/order/order-tracker';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useMemo } from 'react';

const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment': return <Badge variant="destructive" className="capitalize animate-pulse">{status.replace(/_/g, ' ')}</Badge>;
      case 'pre-ordered': return <Badge className="bg-purple-600/10 text-purple-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'new': return <Badge className="bg-orange-500/10 text-orange-600 capitalize">Order Placed</Badge>;
      case 'preparing': return <Badge className="bg-yellow-500/10 text-yellow-600 capitalize">{status}</Badge>;
      case 'ready_for_pickup': return <Badge className="bg-cyan-500/10 text-cyan-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'out_for_delivery': return <Badge className="bg-blue-500/10 text-blue-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'fulfilled':
      case 'delivered': return <Badge className="bg-green-500/10 text-green-600 capitalize">{status}</Badge>;
      case 'canceled': return <Badge variant="destructive" className="capitalize">{status}</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: order, isLoading: orderLoading } = useFirestoreDoc<Order>(`orders/${id}`);
  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');

  const isLoading = orderLoading || productsLoading;

  const productMap = useMemo(() => {
    if (!allProducts) return new Map();
    return new Map(allProducts.map(p => [p.id, p]));
  }, [allProducts]);
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-muted-foreground">The order you are looking for does not exist.</p>
         <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/customer/my-orders">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">Order Details</h1>
                <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono">{order.id}</span></p>
            </div>
        </div>
         <Link href={`/customer/my-orders/${id}/invoice`}>
            <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <CardTitle>Status: {order.status.replace(/_/g, ' ')}</CardTitle>
                    <CardDescription>Placed on {order.createdAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </div>
                {getStatusBadge(order.status)}
            </div>
        </CardHeader>
        <CardContent>
            <OrderTracker status={order.status} orderType={order.orderType} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card>
                <CardHeader><CardTitle>Items Ordered</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.variantSku} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden border flex-shrink-0">
                                    <Image src={productMap.get(item.productId)?.image || 'https://placehold.co/100'} alt={item.productName} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground">SKU: {item.variantSku}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">৳{(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
           </Card>
        </div>
        <div className="space-y-6">
            {order.shippingAddress && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Home size={18}/> Shipping Address</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p className="font-bold text-foreground">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.streetAddress}, {order.shippingAddress.area}</p>
                        <p>{order.shippingAddress.district}</p>
                        <p>{order.shippingAddress.phone}</p>
                    </CardContent>
                </Card>
            )}
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package size={18}/> Payment Summary</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span> <span>৳{order.subtotal?.toFixed(2) ?? 'N/A'}</span></div>
                    {order.discountAmount && order.discountAmount > 0 ? (
                        <div className="flex justify-between"><span className="text-muted-foreground">Discount:</span> <span>- ৳{order.discountAmount.toFixed(2)}</span></div>
                    ) : null}
                    {order.loyaltyDiscount && order.loyaltyDiscount > 0 ? (
                         <div className="flex justify-between"><span className="text-muted-foreground">Loyalty Discount:</span> <span>- ৳{order.loyaltyDiscount.toFixed(2)}</span></div>
                    ): null}
                    <Separator/>
                    <div className="flex justify-between font-bold text-base"><span className="text-foreground">Total:</span> <span>৳{order.totalAmount.toFixed(2)}</span></div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
