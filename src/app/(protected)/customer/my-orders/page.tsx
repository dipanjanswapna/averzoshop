'use client';
import { useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Order, OrderStatus } from '@/types/order';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Outlet } from '@/types/outlet';
import type { UserData } from '@/types/user';
import { MessageCircle, Truck } from 'lucide-react';

const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pre-ordered':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'new':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 capitalize">Order Placed</Badge>;
      case 'preparing':
         return <Badge variant="secondary" className="bg-orange-100 text-orange-800 capitalize">{status}</Badge>;
      case 'ready_for_pickup':
         return <Badge variant="secondary" className="bg-purple-100 text-purple-800 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'out_for_delivery':
          return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'fulfilled':
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800 capitalize">{status}</Badge>;
      case 'canceled':
         return <Badge variant="destructive" className="capitalize">{status}</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userOrdersQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'orders'), 
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: userOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(userOrdersQuery);
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');

  const isLoading = ordersLoading || usersLoading;

  const userMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(u => [u.uid, u]));
  }, [users]);
  
  const handleCompletePayment = async (orderId: string) => {
    if (!firestore) return;
    setUpdatingId(orderId);
    try {
        const orderRef = doc(firestore, 'orders', orderId);
        await updateDoc(orderRef, { status: 'new' });
        toast({ title: 'Payment Complete', description: 'Your order is now being processed.' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Payment Failed', description: 'Could not complete payment. Please try again.' });
    } finally {
        setUpdatingId(null);
    }
  }

  const renderSkeleton = () =>
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
      </TableRow>
    ));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">My Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Here are all the orders you've placed with us.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : userOrders && userOrders.length > 0 ? (
                userOrders.map(order => {
                  const rider = order.riderId ? userMap.get(order.riderId) : null;
                  const riderPhone = rider?.phone ? `88${rider.phone.replace(/\D/g, '').replace(/^0/, '')}` : null;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>{order.createdAt?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
                       <TableCell className="text-right">
                          {order.orderType === 'pre-order' && order.status === 'pre-ordered' && (
                              <Button onClick={() => handleCompletePayment(order.id)} disabled={updatingId === order.id} size="sm">
                                  {updatingId === order.id ? 'Processing...' : 'Complete Payment'}
                              </Button>
                          )}
                          {order.status === 'out_for_delivery' && riderPhone && (
                              <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Contact your rider:</p>
                                  <Button asChild variant="outline" size="sm" className="mt-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-800">
                                      <a href={`https://wa.me/${riderPhone}`} target="_blank" rel="noopener noreferrer">
                                          <MessageCircle className="mr-2 h-4 w-4" />
                                          WhatsApp Rider
                                      </a>
                                  </Button>
                              </div>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        You haven't placed any orders yet.
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
