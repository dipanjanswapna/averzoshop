
'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Badge } from '@/components/ui/badge';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Order, OrderStatus } from '@/types/order';
import type { UserData } from '@/types/user';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';

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

export default function SalesMyOrdersPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();

  const myOrdersQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'orders'), 
      where('salesRepId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: myOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(myOrdersQuery);
  const { data: allUsers, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');

  const isLoading = ordersLoading || usersLoading;

  const customerMap = useMemo(() => {
    if (!allUsers) return new Map();
    return new Map(allUsers.map(u => [u.uid, u.displayName]));
  }, [allUsers]);

  const renderDesktopSkeleton = () => (
    <>
        {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-10 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
  );

  const renderMobileSkeleton = () => (
     <>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden flex-1 min-w-[300px] max-w-sm">
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
            <CardFooter className="bg-muted/50 p-4"><Skeleton className="h-9 w-full" /></CardFooter>
          </Card>
        ))}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">My Placed Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Here are all the orders you've placed on behalf of your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
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
                {isLoading ? renderDesktopSkeleton() : myOrders && myOrders.length > 0 ? (
                    myOrders.map(order => (
                    <TableRow key={order.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/sales/my-orders/${order.id}`)}>
                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{customerMap.get(order.customerId) || 'Unknown Customer'}</TableCell>
                        <TableCell>{order.createdAt?.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="icon" className="h-9 w-9">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            You haven't placed any orders yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-wrap justify-center md:hidden gap-4">
            {isLoading ? renderMobileSkeleton() : myOrders && myOrders.length > 0 ? (
                myOrders.map(order => (
                <Card key={order.id} className="overflow-hidden flex-1 min-w-[300px] max-w-sm">
                    <div className="p-4" onClick={() => router.push(`/sales/my-orders/${order.id}`)}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardDescription>Order ID</CardDescription>
                                <CardTitle className="text-base font-mono text-primary">
                                    {order.id.substring(0, 8)}...
                                </CardTitle>
                            </div>
                            {getStatusBadge(order.status)}
                        </div>
                        <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">For: <span className="font-bold text-foreground">{customerMap.get(order.customerId) || 'Unknown'}</span></p>
                        </div>
                        <div className="flex justify-between items-end mt-2 text-sm">
                            <span className="text-muted-foreground">{order.createdAt?.toDate().toLocaleDateString()}</span>
                            <span className="font-bold text-lg">৳{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <CardFooter className="bg-muted/50 p-4">
                        <Button asChild variant="outline" className="w-full bg-background">
                            <Link href={`/sales/my-orders/${order.id}`}>
                                View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))
            ) : (
                <div className="flex flex-col items-center justify-center text-center h-48 border-2 border-dashed rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Orders Placed</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Go to the "Place Order" page to create a new order.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
