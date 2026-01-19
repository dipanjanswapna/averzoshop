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
import type { Order, OrderStatus } from '@/types/order';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';
import { Check, Package, Send, Truck, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sendNotificationToRole } from '@/ai/flows/send-notification-to-role';

export default function OnlineOrdersPage() {
  const { userData } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const outletId = useMemo(() => userData?.outletId, [userData]);

  const { data: allOrders, isLoading } = useFirestoreQuery<Order>('orders');
  
  const outletOrders = useMemo(() => {
    if (!allOrders || !outletId) return [];
    return allOrders.filter(order => order.assignedOutletId === outletId)
      .sort((a,b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [allOrders, outletId]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!firestore) return;
    setUpdatingId(orderId);
    const orderRef = doc(firestore, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: newStatus });
        toast({ title: 'Order Updated', description: `Order status changed to ${newStatus}.` });

        if (newStatus === 'ready_for_pickup') {
            await sendNotificationToRole({
                role: 'rider',
                title: 'New Delivery Available',
                body: `Order #${orderId.substring(0, 6)} is ready for pickup.`,
                link: '/rider/deliveries'
            });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to update order.' });
        console.error("Error updating order: ", error);
    } finally {
        setUpdatingId(null);
    }
  };

  const renderOrderTable = (orders: Order[], status: OrderStatus) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-center">Action / Status</TableHead>
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
                    <TableCell className="text-center"><Skeleton className="h-9 w-32 mx-auto" /></TableCell>
                </TableRow>
            ))
        ) : orders.length > 0 ? orders.map(order => (
          <TableRow key={order.id}>
            <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
            <TableCell>{order.shippingAddress.name}</TableCell>
            <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
            <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
            <TableCell className="text-center">
                {order.status === 'new' && <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'preparing')} disabled={updatingId === order.id}><Check className="mr-2 h-4 w-4"/>Accept Order</Button>}
                {order.status === 'preparing' && <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')} disabled={updatingId === order.id}><Package className="mr-2 h-4 w-4"/>Ready for Pickup</Button>}
                {order.status === 'ready_for_pickup' && <Button size="sm" variant="outline" disabled><Send className="mr-2 h-4 w-4"/>Awaiting Rider</Button>}
                {order.status === 'out_for_delivery' && <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Truck className="mr-2 h-4 w-4" />On its way</Badge>}
                {order.status === 'delivered' && <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-2 h-4 w-4" />Delivered</Badge>}
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
  
  const filterOrders = (status: OrderStatus) => outletOrders.filter(o => o.status === status);

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
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="new">New Orders</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="ready_for_pickup">Ready for Pickup</TabsTrigger>
              <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="mt-4">
              {renderOrderTable(filterOrders('new'), 'new')}
            </TabsContent>
             <TabsContent value="preparing" className="mt-4">
              {renderOrderTable(filterOrders('preparing'), 'preparing')}
            </TabsContent>
             <TabsContent value="ready_for_pickup" className="mt-4">
              {renderOrderTable(filterOrders('ready_for_pickup'), 'ready_for_pickup')}
            </TabsContent>
            <TabsContent value="out_for_delivery" className="mt-4">
              {renderOrderTable(filterOrders('out_for_delivery'), 'out_for_delivery')}
            </TabsContent>
             <TabsContent value="delivered" className="mt-4">
              {renderOrderTable(filterOrders('delivered'), 'delivered')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
