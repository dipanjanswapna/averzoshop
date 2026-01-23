'use client';
import { useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { DeliveryMonitor } from './delivery-monitor';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/types/order';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button, buttonVariants } from '@/components/ui/button';
import { MoreHorizontal, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cancelOrder } from '@/actions/order-actions';


function OrderTable({ orders, isLoading, onCancelClick }: { orders: Order[], isLoading: boolean, onCancelClick: (order: Order) => void }) {
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending_payment': return <Badge variant="destructive" className="capitalize animate-pulse">{status.replace(/_/g, ' ')}</Badge>;
      case 'pre-ordered': return <Badge className="bg-purple-600/10 text-purple-600 capitalize">{status.replace(/_/g, ' ')}</Badge>;
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

  const renderDesktopSkeleton = () => [...Array(5)].map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
  ));

  const renderMobileSkeleton = () => [...Array(3)].map((_, i) => (
    <Card key={i} className="flex-1 min-w-[280px]">
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
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            {!['canceled', 'delivered', 'fulfilled'].includes(order.status) && (
                                <DropdownMenuItem className="text-destructive" onClick={() => onCancelClick(order)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No orders found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap justify-center gap-4 md:hidden">
        {isLoading ? renderMobileSkeleton() : orders.length > 0 ? (
          orders.map(order => (
            <Card key={order.id} className="flex flex-col flex-1 min-w-[280px] max-w-sm">
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

export default function OrdersPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useFirestoreQuery<Order>(ordersQuery);

  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const filterOrders = (status: Order['status']) => {
    return orders?.filter(o => o.status === status) || [];
  };

  const handleCancelClick = (order: Order) => {
      setOrderToCancel(order);
      setIsCancelAlertOpen(true);
  };

  const handleConfirmCancel = async () => {
      if (!orderToCancel) return;
      setIsCanceling(true);
      const result = await cancelOrder(orderToCancel.id);
      if (result.success) {
          toast({ title: 'Order Canceled', description: `Order #${orderToCancel.id.substring(0,8)} has been canceled.` });
      } else {
          toast({ variant: 'destructive', title: 'Cancellation Failed', description: result.message });
      }
      setIsCanceling(false);
      setIsCancelAlertOpen(false);
      setOrderToCancel(null);
  };

  return (
    <>
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
              <div className="w-full overflow-x-auto no-scrollbar">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="preparing">Preparing</TabsTrigger>
                  <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                  <TabsTrigger value="canceled">Canceled</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-4">
                <OrderTable orders={orders || []} isLoading={isLoading} onCancelClick={handleCancelClick} />
              </TabsContent>
              <TabsContent value="new" className="mt-4">
                <OrderTable orders={filterOrders('new')} isLoading={isLoading} onCancelClick={handleCancelClick} />
              </TabsContent>
              <TabsContent value="preparing" className="mt-4">
                <OrderTable orders={filterOrders('preparing')} isLoading={isLoading} onCancelClick={handleCancelClick} />
              </TabsContent>
              <TabsContent value="out_for_delivery" className="mt-4">
                <OrderTable orders={filterOrders('out_for_delivery')} isLoading={isLoading} onCancelClick={handleCancelClick} />
              </TabsContent>
              <TabsContent value="delivered" className="mt-4">
                <OrderTable orders={filterOrders('delivered')} isLoading={isLoading} onCancelClick={handleCancelClick} />
              </TabsContent>
              <TabsContent value="canceled" className="mt-4">
                <OrderTable orders={filterOrders('canceled')} isLoading={isLoading} onCancelClick={handleCancelClick} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will cancel order <span className="font-mono font-bold">{orderToCancel?.id.substring(0,8)}</span> and restore stock. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmCancel} disabled={isCanceling} className={buttonVariants({ variant: "destructive" })}>
                      {isCanceling ? 'Canceling...' : 'Yes, Cancel Order'}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
