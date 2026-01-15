
'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/types/order';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

export default function OnlineOrdersPage() {
  const { userData } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const outletId = useMemo(() => userData?.outletId, [userData]);

  // We fetch all orders and filter client-side.
  // For a large-scale app, a query with `where("assignedOutletId", "==", outletId)` would be more efficient.
  const { data: allOrders, isLoading } = useFirestoreQuery<Order>('orders');
  
  const outletOrders = useMemo(() => {
    if (!allOrders || !outletId) return [];
    return allOrders.filter(order => order.assignedOutletId === outletId);
  }, [allOrders, outletId]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: 'preparing' });
        toast({ title: 'Order Accepted', description: 'The order is now in the preparing queue.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to accept order.' });
        console.error("Error accepting order: ", error);
    }
  };

  const renderOrderTable = (orders: Order[], status: Order['status']) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
            [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
                </TableRow>
            ))
        ) : orders.length > 0 ? orders.map(order => (
          <TableRow key={order.id}>
            <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
            <TableCell>{order.shippingAddress.name}</TableCell>
            <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
            <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
            <TableCell className="text-right">
                {status === 'new' && <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>Accept Order</Button>}
                {status === 'preparing' && <Button size="sm">Ready to Ship</Button>}
                {status === 'shipped' && <Button size="sm" variant="outline" disabled>Handed Over</Button>}
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No orders in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Online Order Fulfillment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Online Orders</CardTitle>
          <CardDescription>Prepare and dispatch orders for D2C customers assigned to your outlet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">New Orders</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="mt-4">
              {renderOrderTable(outletOrders.filter(o => o.status === 'new'), 'new')}
            </TabsContent>
             <TabsContent value="preparing" className="mt-4">
              {renderOrderTable(outletOrders.filter(o => o.status === 'preparing'), 'preparing')}
            </TabsContent>
             <TabsContent value="shipped" className="mt-4">
              {renderOrderTable(outletOrders.filter(o => o.status === 'shipped'), 'shipped')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
