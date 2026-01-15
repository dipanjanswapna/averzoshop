
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
import { Badge } from '@/components/ui/badge';
import { DeliveryMonitor } from './delivery-monitor';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';

interface Sale {
  id: string;
  outletId: string;
  soldBy: string;
  totalAmount: number;
  createdAt: {
    toDate: () => Date;
  };
  // This can be expanded to include online order details
  status?: 'Delivered' | 'Pending' | 'Shipped' | 'Canceled';
}

export default function OrdersPage() {
  const { data: sales, isLoading } = useFirestoreQuery<Sale>('pos_sales');

  const orders = sales?.map(sale => ({
    id: sale.id,
    customer: `User-${sale.soldBy.substring(0, 6)}`,
    date: sale.createdAt.toDate().toLocaleDateString(),
    total: sale.totalAmount,
    status: sale.status || 'Delivered'
  })) || [];


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
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="canceled">Canceled</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <OrderTable orders={orders} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="pending">
              <OrderTable orders={orders.filter(o => o.status === 'Pending')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="shipped">
              <OrderTable orders={orders.filter(o => o.status === 'Shipped')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="delivered">
              <OrderTable orders={orders.filter(o => o.status === 'Delivered')} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="canceled">
              <OrderTable orders={orders.filter(o => o.status === 'Canceled')} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderTable({ orders, isLoading }: { orders: any[], isLoading: boolean }) {
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
              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>
                <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-accent text-accent-foreground' : ''}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
            </TableRow>
          ))
        ) : (
            <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                    No orders found.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
