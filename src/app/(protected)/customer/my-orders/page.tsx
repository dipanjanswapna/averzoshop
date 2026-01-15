
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
import { Badge } from '@/components/ui/badge';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  createdAt: { toDate: () => Date };
  totalAmount: number;
  // This can be expanded later
  status?: 'Delivered' | 'Pending' | 'Shipped' | 'Canceled';
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  // This query needs to be more specific in a real app, e.g., using where('userId', '==', user.uid)
  const { data: orders, isLoading } = useFirestoreQuery<Order>('pos_sales');

  const userOrders = orders?.filter(() => true); // Placeholder for user-specific filtering

  const renderSkeleton = () =>
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : userOrders && userOrders.length > 0 ? (
                userOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-accent text-accent-foreground' : ''}>
                        {order.status || 'Delivered'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
