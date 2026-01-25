
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestoreDoc, useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Order, OrderStatus } from '@/types/order';
import type { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hand, BadgePercent, Printer, ShoppingCart, Truck } from 'lucide-react';
import Image from 'next/image';
import { OrderTracker } from '@/components/order/order-tracker';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { UserData } from '@/types/user';
import { InvoicePreviewDialog } from '@/components/order/InvoicePreviewDialog';


const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment': return <Badge variant="destructive" className="capitalize animate-pulse">{status.replace(/_/g, ' ')}</Badge>;
      case 'pre-ordered': return <Badge className="bg-purple-600/10 text-purple-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'new': return <Badge className="bg-orange-500/10 text-orange-600 capitalize">Order Placed</Badge>;
      case 'preparing': return <Badge className="bg-yellow-500/10 text-yellow-600 capitalize">{status}</Badge>;
      case 'ready_for_pickup': return <Badge className="bg-cyan-500/10 text-cyan-600 capitalize">{status.replace(/_/g, ' ')}</Badge>;
      case 'out_for_delivery': return <Badge className="bg-blue-500/10 text-blue-600 capitalize">{status.replace(/_/g, ' ')}</Badge>;
      case 'fulfilled':
      case 'delivered': return <Badge className="bg-green-500/10 text-green-600 capitalize">{status}</Badge>;
      case 'canceled': return <Badge variant="destructive" className="capitalize">{status}</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const { data: order, isLoading: orderLoading } = useFirestoreDoc<Order>(`orders/${id}`);
  const { data: customer, isLoading: customerLoading } = useFirestoreDoc<UserData>(order ? `users/${order.customerId}` : null);
  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');

  const isLoading = orderLoading || productsLoading || customerLoading;

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
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="w-full lg:w-96 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
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

  const orderTypeIcon = order.orderMode === 'delivery' ? <Truck size={18}/> : <Hand size={18}/>;

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/sales/my-orders">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">Order Details</h1>
                <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono">{order.id}</span></p>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(order.status)}
            <Button variant="outline" onClick={() => setIsInvoiceOpen(true)}>
                <Printer className="mr-2 h-4 w-4" />
                Invoice
            </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Order Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderTracker status={order.status} orderType={order.orderType} orderMode={order.orderMode} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart size={20}/> Items Ordered ({order.items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.variantSku} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden border flex-shrink-0">
                                    <Image src={productMap.get(item.productId)?.image || 'https://placehold.co/100'} alt={item.productName} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.productName}</p>
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

        <div className="w-full lg:w-96 lg:sticky top-24 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        {orderTypeIcon} Customer &amp; Shipping
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p className="font-bold text-foreground">{customer?.displayName}</p>
                    <p>{customer?.email}</p>
                     {order.orderMode === 'delivery' && order.shippingAddress ? (
                       <div className="mt-2 pt-2 border-t">
                         <p className="font-bold text-foreground">{order.shippingAddress.name}</p>
                         <p>{order.shippingAddress.streetAddress}, {order.shippingAddress.area}</p>
                         <p>{order.shippingAddress.district}</p>
                         <p>{order.shippingAddress.phone}</p>
                       </div>
                    ) : (
                       <div className="mt-2 pt-2 border-t">
                         <p className="font-bold text-foreground">Store Pickup</p>
                         {order.pickupCode && (
                             <div className="mt-2">
                                 <p className="font-bold text-foreground">Pickup Code:</p>
                                 <p className="text-2xl font-bold text-primary font-mono tracking-widest bg-muted p-2 rounded-md text-center">{order.pickupCode}</p>
                             </div>
                         )}
                       </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BadgePercent size={18}/> Payment Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span> <span>৳{order.subtotal?.toFixed(2) ?? 'N/A'}</span></div>
                    
                    {order.cardPromoDiscountAmount && order.cardPromoDiscountAmount > 0 ? (
                        <div className="flex justify-between text-green-600"><span className="text-muted-foreground">↳ Card Promo:</span> <span>- ৳{order.cardPromoDiscountAmount.toFixed(2)}</span></div>
                    ) : null}

                    {order.discountAmount && order.discountAmount > 0 ? (
                        <div className="flex justify-between text-green-600"><span className="text-muted-foreground">↳ Coupon Discount:</span> <span>- ৳{order.discountAmount.toFixed(2)}</span></div>
                    ) : null}
                    
                    {order.loyaltyDiscount && order.loyaltyDiscount > 0 ? (
                         <div className="flex justify-between text-green-600"><span className="text-muted-foreground">↳ Loyalty Discount:</span> <span>- ৳{order.loyaltyDiscount.toFixed(2)}</span></div>
                    ): null}
                    
                    {order.giftCardDiscount && order.giftCardDiscount > 0 ? (
                         <div className="flex justify-between text-green-600"><span className="text-muted-foreground">↳ Gift Card:</span> <span>- ৳{order.giftCardDiscount.toFixed(2)}</span></div>
                    ): null}

                    <Separator/>
                    <div className="flex justify-between font-bold text-base"><span className="text-foreground">Total:</span> <span>৳{order.totalAmount.toFixed(2)}</span></div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
    <InvoicePreviewDialog
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        order={order}
        customer={customer}
    />
    </>
  );
}
