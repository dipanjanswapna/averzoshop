'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Check, Package, Send, Truck, CheckCircle, Hand, Clock, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sendNotificationToRole } from '@/ai/flows/send-notification-to-role';
import { sendTargetedNotification } from '@/ai/flows/send-targeted-notification';

export default function OnlineOrdersPage() {
  const { userData } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const outletId = useMemo(() => userData?.outletId, [userData]);

  const { data: allOrders, isLoading } = useFirestoreQuery<Order>('orders');
  
  const deliveryOrders = useMemo(() => {
    if (!allOrders || !outletId) return [];
    return allOrders.filter(order => order.assignedOutletId === outletId && order.orderMode === 'delivery')
      .sort((a,b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [allOrders, outletId]);

  const pickupOrders = useMemo(() => {
    if (!allOrders || !outletId) return [];
    return allOrders.filter(order => (order.assignedOutletId === outletId || order.pickupOutletId === outletId) && order.orderMode === 'pickup')
      .sort((a,b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [allOrders, outletId]);

  const handleUpdateDeliveryStatus = async (orderId: string, newStatus: OrderStatus) => {
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

  const handleMarkFulfilled = async (order: Order) => {
    if (!firestore) return;
    setUpdatingId(order.id);
    try {
      const response = await fetch('/api/orders/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, newStatus: 'fulfilled' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      toast({ title: 'Order Collected', description: 'Order has been marked as fulfilled.' });
      await sendTargetedNotification({
          userId: order.customerId,
          title: 'Your Order Has Been Collected!',
          body: `Your order #${order.id.substring(0,6)} has been successfully picked up.`,
          link: '/customer/my-orders'
      });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to update order.', description: error.message });
        console.error("Error updating order:", error);
    } finally {
        setUpdatingId(null);
    }
  };
  
  const filterDeliveryOrders = (status: OrderStatus) => deliveryOrders.filter(o => o.status === status);
  const pendingPickupOrders = pickupOrders.filter(o => o.status === 'new' || o.status === 'pending_payment');
  const completedPickupOrders = pickupOrders.filter(o => o.status === 'fulfilled' || o.status === 'canceled');


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Order Fulfillment</h1>
      <Tabs defaultValue="delivery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delivery">Delivery Fulfillment</TabsTrigger>
            <TabsTrigger value="pickup">Store Pickup</TabsTrigger>
        </TabsList>
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Manage Delivery Orders</CardTitle>
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
                <TabsContent value="new" className="mt-4"><OrdersView orders={filterDeliveryOrders('new')} isLoading={isLoading} onAction={handleUpdateDeliveryStatus} updatingId={updatingId} orderType="delivery"/></TabsContent>
                <TabsContent value="preparing" className="mt-4"><OrdersView orders={filterDeliveryOrders('preparing')} isLoading={isLoading} onAction={handleUpdateDeliveryStatus} updatingId={updatingId} orderType="delivery"/></TabsContent>
                <TabsContent value="ready_for_pickup" className="mt-4"><OrdersView orders={filterDeliveryOrders('ready_for_pickup')} isLoading={isLoading} onAction={handleUpdateDeliveryStatus} updatingId={updatingId} orderType="delivery"/></TabsContent>
                <TabsContent value="out_for_delivery" className="mt-4"><OrdersView orders={filterDeliveryOrders('out_for_delivery')} isLoading={isLoading} onAction={handleUpdateDeliveryStatus} updatingId={updatingId} orderType="delivery"/></TabsContent>
                <TabsContent value="delivered" className="mt-4"><OrdersView orders={filterDeliveryOrders('delivered')} isLoading={isLoading} onAction={handleUpdateDeliveryStatus} updatingId={updatingId} orderType="delivery"/></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pickup">
           <Card>
            <CardHeader>
              <CardTitle>Manage Pickup Orders</CardTitle>
              <CardDescription>Verify pickup codes and hand over orders to customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending">Pending Collection</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                 <TabsContent value="pending" className="mt-4"><OrdersView orders={pendingPickupOrders} isLoading={isLoading} onAction={handleMarkFulfilled} updatingId={updatingId} orderType="pickup" /></TabsContent>
                 <TabsContent value="completed" className="mt-4"><OrdersView orders={completedPickupOrders} isLoading={isLoading} onAction={handleMarkFulfilled} updatingId={updatingId} orderType="pickup"/></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable component to display orders in a table or cards
function OrdersView({ orders, isLoading, onAction, updatingId, orderType }: { orders: Order[], isLoading: boolean, onAction: (orderOrId: any, newStatus?: OrderStatus) => void, updatingId: string | null, orderType: 'delivery' | 'pickup' }) {
    const renderDesktopSkeleton = (cols: number) => (
        [...Array(3)].map((_, i) => (
            <TableRow key={i}>
                {[...Array(cols)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
            </TableRow>
        ))
    );
    const renderMobileSkeleton = () => (
        [...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent><CardFooter><Skeleton className="h-9 w-full" /></CardFooter></Card>
        ))
    );

    if (isLoading) {
        return (
            <div>
                <div className="hidden md:block"><Table><TableHeader>{orderType === 'delivery' ? <DeliveryHeader/> : <PickupHeader/>}</TableHeader><TableBody>{renderDesktopSkeleton(orderType === 'delivery' ? 5 : 6)}</TableBody></Table></div>
                <div className="grid md:hidden gap-4">{renderMobileSkeleton()}</div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-48 border-2 border-dashed rounded-lg">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Orders Here</h3>
                <p className="mt-1 text-sm text-muted-foreground">There are no orders in this category.</p>
            </div>
        )
    }
    
    return (
        <div>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>{orderType === 'delivery' ? <DeliveryHeader/> : <PickupHeader/>}</TableHeader>
                    <TableBody>
                        {orders.map(order => orderType === 'delivery' ? <DeliveryRow key={order.id} order={order} onAction={onAction} updatingId={updatingId} /> : <PickupRow key={order.id} order={order} onAction={onAction} updatingId={updatingId} />)}
                    </TableBody>
                </Table>
            </div>
            <div className="grid md:hidden gap-4">
                {orders.map(order => orderType === 'delivery' ? <DeliveryCard key={order.id} order={order} onAction={onAction} updatingId={updatingId} /> : <PickupCard key={order.id} order={order} onAction={onAction} updatingId={updatingId} />)}
            </div>
        </div>
    )
}

// Components for Delivery Orders
const DeliveryHeader = () => (<TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-center">Action / Status</TableHead></TableRow>);

const DeliveryRow = ({ order, onAction, updatingId }: { order: Order, onAction: (id: string, status: OrderStatus) => void, updatingId: string | null}) => (
    <TableRow key={order.id}>
        <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
        <TableCell>{order.shippingAddress?.name}</TableCell>
        <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
        <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
        <TableCell className="text-center">
            {order.status === 'new' && <Button size="sm" onClick={() => onAction(order.id, 'preparing')} disabled={updatingId === order.id}><Check className="mr-2 h-4 w-4"/>Accept Order</Button>}
            {order.status === 'preparing' && <Button size="sm" onClick={() => onAction(order.id, 'ready_for_pickup')} disabled={updatingId === order.id}><Package className="mr-2 h-4 w-4"/>Ready for Pickup</Button>}
            {order.status === 'ready_for_pickup' && <Button size="sm" variant="outline" disabled><Send className="mr-2 h-4 w-4"/>Awaiting Rider</Button>}
            {order.status === 'out_for_delivery' && <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Truck className="mr-2 h-4 w-4" />On its way</Badge>}
            {order.status === 'delivered' && <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-2 h-4 w-4" />Delivered</Badge>}
        </TableCell>
    </TableRow>
);

const DeliveryCard = ({ order, onAction, updatingId }: { order: Order, onAction: (id: string, status: OrderStatus) => void, updatingId: string | null}) => (
    <Card key={order.id}>
        <CardHeader>
            <CardTitle className="text-sm font-mono text-primary">{order.id.substring(0,8)}...</CardTitle>
            <CardDescription>{order.shippingAddress?.name}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-end">
                <div className="text-sm text-muted-foreground">{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</div>
                <div className="text-lg font-bold">৳{order.totalAmount.toFixed(2)}</div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            {order.status === 'new' && <Button className="w-full" size="sm" onClick={() => onAction(order.id, 'preparing')} disabled={updatingId === order.id}><Check className="mr-2 h-4 w-4"/>Accept Order</Button>}
            {order.status === 'preparing' && <Button className="w-full" size="sm" onClick={() => onAction(order.id, 'ready_for_pickup')} disabled={updatingId === order.id}><Package className="mr-2 h-4 w-4"/>Ready for Pickup</Button>}
            {order.status === 'ready_for_pickup' && <Button className="w-full" size="sm" variant="outline" disabled><Send className="mr-2 h-4 w-4"/>Awaiting Rider</Button>}
            {order.status === 'out_for_delivery' && <Badge variant="secondary" className="bg-blue-100 text-blue-800 w-full justify-center py-2"><Truck className="mr-2 h-4 w-4" />On its way</Badge>}
            {order.status === 'delivered' && <Badge className="bg-green-100 text-green-800 w-full justify-center py-2"><CheckCircle className="mr-2 h-4 w-4" />Delivered</Badge>}
        </CardFooter>
    </Card>
);


// Components for Pickup Orders
const PickupHeader = () => (<TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Pickup Code</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-center">Action</TableHead></TableRow>);

const PickupRow = ({ order, onAction, updatingId }: { order: Order, onAction: (order: Order) => void, updatingId: string | null}) => (
    <TableRow key={order.id}>
        <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
        <TableCell>{order.shippingAddress?.name || 'N/A'}</TableCell>
        <TableCell>{order.shippingAddress?.phone || 'N/A'}</TableCell>
        <TableCell><Badge variant="outline" className="font-bold text-base tracking-widest">{order.pickupCode}</Badge></TableCell>
        <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
        <TableCell className="text-center">
            { (order.status === 'new' || order.status === 'pending_payment') && 
                <Button size="sm" onClick={() => onAction(order)} disabled={updatingId === order.id}><Hand className="mr-2 h-4 w-4"/>Mark as Collected</Button>
            }
            {order.status === 'fulfilled' && <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-2 h-4 w-4" />Collected</Badge>}
            {order.status === 'canceled' && <Badge variant="destructive">Canceled</Badge>}
        </TableCell>
    </TableRow>
);

const PickupCard = ({ order, onAction, updatingId }: { order: Order, onAction: (order: Order) => void, updatingId: string | null}) => (
    <Card key={order.id}>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-sm font-mono text-primary">{order.id.substring(0,8)}...</CardTitle>
                    <CardDescription>{order.shippingAddress?.name || 'N/A'}</CardDescription>
                </div>
                <Badge variant="outline" className="font-bold text-lg tracking-widest">{order.pickupCode}</Badge>
            </div>
        </CardHeader>
        <CardContent>
             <div className="flex justify-between items-end">
                <div className="text-sm text-muted-foreground">{order.shippingAddress?.phone || 'N/A'}</div>
                <div className="text-lg font-bold">৳{order.totalAmount.toFixed(2)}</div>
            </div>
        </CardContent>
        <CardFooter>
            { (order.status === 'new' || order.status === 'pending_payment') && 
                <Button className="w-full" size="sm" onClick={() => onAction(order)} disabled={updatingId === order.id}><Hand className="mr-2 h-4 w-4"/>Mark as Collected</Button>
            }
            {order.status === 'fulfilled' && <Badge className="bg-green-100 text-green-800 w-full justify-center py-2"><CheckCircle className="mr-2 h-4 w-4" />Collected</Badge>}
            {order.status === 'canceled' && <Badge variant="destructive" className="w-full justify-center py-2">Canceled</Badge>}
        </CardFooter>
    </Card>
);
