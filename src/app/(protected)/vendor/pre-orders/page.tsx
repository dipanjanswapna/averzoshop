'use client';

import { useMemo, useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import type { Order, OrderStatus } from '@/types/order';
import type { Product } from '@/types/product';
import { PackageCheck } from 'lucide-react';
import { sendTargetedNotification } from '@/ai/flows/send-targeted-notification';

export default function VendorPreOrdersPage() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading: ordersLoading } = useFirestoreQuery<Order>('orders');
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const vendorProductIds = useMemo(() => {
    if (!products || !user) return new Set();
    return new Set(products.filter(p => p.vendorId === user.uid).map(p => p.id));
  }, [products, user]);

  const vendorPreOrders = useMemo(() => {
    if (!orders || vendorProductIds.size === 0) return [];
    return orders
      .filter(order => 
        order.orderType === 'pre-order' &&
        order.items.some(item => vendorProductIds.has(item.productId))
      )
      .sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [orders, vendorProductIds]);

  const handleStartFulfillment = async (order: Order) => {
    if (!firestore) return;
    setUpdatingStatus(order.id);
    const orderRef = doc(firestore, 'orders', order.id);
    try {
      // Change status to 'pending_payment' to request final payment from customer
      await updateDoc(orderRef, { status: 'pending_payment' });

      // Notify customer
      await sendTargetedNotification({
        userId: order.customerId,
        title: "Your Pre-order is Ready!",
        body: `Please complete the final payment for order #${order.id.substring(0, 6)} to begin shipping.`,
        link: '/customer/my-orders'
      });

      toast({
        title: 'Fulfillment Started',
        description: 'The customer has been notified to complete their payment.',
      });
    } catch (error) {
      console.error('Error updating pre-order status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the pre-order status.',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pre-ordered':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">{status}</Badge>;
      case 'pending_payment':
        return <Badge variant="destructive" className="capitalize animate-pulse">Pending Payment</Badge>;
      case 'fulfilled':
        return <Badge variant="default" className="bg-green-100 text-green-800 capitalize">{status}</Badge>;
      case 'new':
        return <Badge variant="default" className="bg-teal-100 text-teal-800 capitalize">Ready for Fulfillment</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
      </TableRow>
    ))
  );
  
  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Pre-order Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>My Pre-orders</CardTitle>
          <CardDescription>Manage and fulfill pre-orders for your products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : vendorPreOrders.length > 0 ? vendorPreOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.shippingAddress?.name}</TableCell>
                  <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>৳{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    {order.status === 'pre-ordered' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartFulfillment(order)}
                        disabled={updatingStatus === order.id}
                        className="gap-2"
                      >
                         <PackageCheck size={16} />
                        {updatingStatus === order.id ? 'Notifying...' : 'Request Final Payment'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No pre-orders found for your products.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
