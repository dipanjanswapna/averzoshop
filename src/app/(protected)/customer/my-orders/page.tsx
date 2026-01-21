
'use client';
import { useMemo, useState } from 'react';
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
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { Order, OrderStatus } from '@/types/order';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { UserData } from '@/types/user';
import { MessageCircle, Copy, ArrowRight } from 'lucide-react';
import { createSslCommerzSession } from '@/actions/payment-actions';

const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment': return <Badge variant="destructive" className="capitalize animate-pulse">{status.replace(/_/g, ' ')}</Badge>;
      case 'pre-ordered': return <Badge className="bg-purple-600/10 text-purple-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'new': return <Badge className="bg-orange-500/10 text-orange-600 capitalize">Order Placed</Badge>;
      case 'preparing': return <Badge className="bg-yellow-500/10 text-yellow-600 capitalize">{status}</Badge>;
      case 'ready_for_pickup': return <Badge className="bg-cyan-500/10 text-cyan-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'out_for_delivery': return <Badge className="bg-blue-500/10 text-blue-600 capitalize">{status.replace('_', ' ')}</Badge>;
      case 'fulfilled':
      case 'delivered': return <Badge className="bg-green-500/10 text-green-600 capitalize">{status}</Badge>;
      case 'canceled': return <Badge variant="destructive" className="capitalize">{status}</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};

export default function MyOrdersPage() {
  const { user, userData } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userOrdersQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'orders'), 
      where('customerId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: userOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(userOrdersQuery);
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');

  const isLoading = ordersLoading || usersLoading;

  const sortedUserOrders = useMemo(() => {
    if (!userOrders) return [];
    return [...userOrders].sort((a, b) => (b.createdAt?.toDate().getTime() || 0) - (a.createdAt?.toDate().getTime() || 0));
  }, [userOrders]);

  const userMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(u => [u.uid, u]));
  }, [users]);
  
  const handleCompletePayment = async (order: Order) => {
    if (!userData || !user) {
        toast({ variant: 'destructive', title: 'Please log in again.' });
        return;
    }
    setUpdatingId(order.id);
    try {
        const remainingAmount = (order.fullOrderValue || order.totalAmount) - order.totalAmount;
        if (remainingAmount <= 0) {
            const orderRef = doc(firestore, 'orders', order.id);
            await updateDoc(orderRef, { status: 'new', paymentStatus: 'Paid' });
            toast({ title: 'Order Confirmed', description: 'Your order is now being processed.' });
            return;
        }

        const session = await createSslCommerzSession(order, userData, remainingAmount);

        if (session.redirectUrl) {
            router.push(session.redirectUrl);
        } else {
            throw new Error("Failed to get payment URL.");
        }
    } catch (e: any) {
        console.error("Payment initiation failed:", e);
        toast({ variant: 'destructive', title: 'Payment Failed', description: e.message || 'Could not connect to payment gateway.' });
    } finally {
        setUpdatingId(null);
    }
  }

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    toast({
      title: 'Order ID Copied!',
      description: `${orderId} copied to clipboard.`,
    });
  };

  const renderDesktopSkeleton = () => (
    <>
        {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
  );

  const renderMobileSkeleton = () => (
     <>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-6 w-24" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
    </>
  );

  const renderAction = (order: Order) => {
    const rider = order.riderId ? userMap.get(order.riderId) : null;
    const riderPhone = rider?.phone ? `88${rider.phone.replace(/\D/g, '').replace(/^0/, '')}` : null;
    
    if (order.status === 'pending_payment') {
      return (
        <Button onClick={(e) => {e.stopPropagation(); e.preventDefault(); handleCompletePayment(order);}} disabled={updatingId === order.id} size="sm" className="w-full md:w-auto">
            {updatingId === order.id ? 'Processing...' : 'Complete Payment'}
        </Button>
      );
    }

    if (order.status === 'out_for_delivery' && riderPhone) {
      return (
        <div className="text-right w-full">
            <p className="text-xs text-muted-foreground">Contact your rider:</p>
            <Button asChild variant="outline" size="sm" className="mt-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-800 w-full md:w-auto">
                <a href={`https://wa.me/${riderPhone}`} target="_blank" rel="noopener noreferrer" onClick={(e) => {e.stopPropagation();}}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp Rider
                </a>
            </Button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">My Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Here are all the orders you've placed with us.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
             <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? renderDesktopSkeleton() : sortedUserOrders && sortedUserOrders.length > 0 ? (
                    sortedUserOrders.map(order => (
                    <TableRow key={order.id} className="group">
                        <TableCell className="font-medium">
                            <Link href={`/customer/my-orders/${order.id}`} className="hover:underline">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{order.id.substring(0, 8)}...</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleCopyOrderId(order.id); }}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="sr-only">Copy Order ID</span>
                                    </Button>
                                </div>
                            </Link>
                        </TableCell>
                        <TableCell>{order.createdAt?.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-2">
                                {renderAction(order)}
                                <Link href={`/customer/my-orders/${order.id}`} passHref>
                                    <Button variant="outline" size="icon" className="h-9 w-9">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                           </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            You haven't placed any orders yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="grid md:hidden gap-4">
              {isLoading ? renderMobileSkeleton() : sortedUserOrders && sortedUserOrders.length > 0 ? (
                sortedUserOrders.map(order => (
                    <Link key={order.id} href={`/customer/my-orders/${order.id}`} className="block">
                        <Card className="flex flex-col h-full hover:bg-muted/50">
                            <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-sm font-mono text-primary">{order.id.substring(0,8)}...</CardTitle>
                                    <CardDescription>{order.createdAt?.toDate().toLocaleDateString()}</CardDescription>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                            <p className="text-lg font-bold text-right">৳{order.totalAmount.toFixed(2)}</p>
                            </CardContent>
                            {renderAction(order) && (
                                <CardFooter onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                                    {renderAction(order)}
                                </CardFooter>
                            )}
                        </Card>
                    </Link>
                ))
              ) : (
                <div className="text-center py-10">You haven't placed any orders yet.</div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
