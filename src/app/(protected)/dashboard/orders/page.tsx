
'use client';
import { useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { DeliveryMonitor } from './delivery-monitor';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/types/order';


export default function OrdersPage() {
  const { firestore } = useFirebase();

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useFirestoreQuery<Order>(ordersQuery);

  const filterOrders = (status: Order['status']) => {
    return orders?.filter(o => o.status === status) || [];
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Orders & Delivery</h1>
      
      <DeliveryMonitor />

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>A list of all past and present orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="canceled">Canceled</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <OrderTable orders={orders || []} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="new" className="mt-4">
              <OrderTable orders={filterOrders('new')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="preparing" className="mt-4">
              <OrderTable orders={filterOrders('preparing')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="out_for_delivery" className="mt-4">
               <OrderTable orders={filterOrders('out_for_delivery')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="delivered" className="mt-4">
              <OrderTable orders={filterOrders('delivered')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="canceled" className="mt-4">
              <OrderTable orders={filterOrders('canceled')} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderTable({ orders, isLoading }: { orders: Order[], isLoading: boolean }) {
  const renderSkeleton = () =>
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
      </TableRow>
    ));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? renderSkeleton() : orders.length > 0 ? (
          orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>{order.shippingAddress.name}</TableCell>
              <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className={order.status === 'delivered' ? 'bg-accent text-accent-foreground capitalize' : 'capitalize'}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
            </TableRow>
          ))
        ) : (
            <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                    No orders found in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
