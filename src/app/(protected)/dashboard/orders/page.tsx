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
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending_payment': return <Badge variant="destructive" className="capitalize animate-pulse">{status.replace('_', ' ')}</Badge>;
      case 'pre-ordered': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'new': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 capitalize">Order Placed</Badge>;
      case 'preparing': return <Badge variant="secondary" className="bg-orange-100 text-orange-800 capitalize">{status}</Badge>;
      case 'ready_for_pickup': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'out_for_delivery': return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'fulfilled':
      case 'delivered': return <Badge variant="default" className="bg-green-100 text-green-800 capitalize">{status}</Badge>;
      case 'canceled': return <Badge variant="destructive" className="capitalize">{status}</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const renderDesktopSkeleton = () => [...Array(5)].map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
    </TableRow>
  ));

  const renderMobileSkeleton = () => [...Array(3)].map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  ));

  return (
    <>
      <div className="hidden md:block">
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
            {isLoading ? renderDesktopSkeleton() : orders.length > 0 ? (
              orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.shippingAddress?.name || 'N/A'}</TableCell>
                  <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
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
      </div>
      <div className="grid md:hidden gap-4">
        {isLoading ? renderMobileSkeleton() : orders.length > 0 ? (
          orders.map(order => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-mono text-primary">{order.id.substring(0,8)}...</CardTitle>
                    <CardDescription>{order.shippingAddress?.name || 'N/A'}</CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex justify-between items-end">
                  <p className="text-xs text-muted-foreground">{order.createdAt?.toDate().toLocaleDateString()}</p>
                  <p className="text-lg font-bold text-right">৳{order.totalAmount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center h-24 flex items-center justify-center col-span-full">
            No orders found in this category.
          </div>
        )}
      </div>
    </>
  );
}