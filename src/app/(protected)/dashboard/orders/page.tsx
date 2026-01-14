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
import { orders } from '@/lib/data';
import { DeliveryMonitor } from './delivery-monitor';

export default function OrdersPage() {
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
              <OrderTable orders={orders} />
            </TabsContent>
            <TabsContent value="pending">
              <OrderTable orders={orders.filter(o => o.status === 'Pending')} />
            </TabsContent>
            <TabsContent value="shipped">
              <OrderTable orders={orders.filter(o => o.status === 'Shipped')} />
            </TabsContent>
            <TabsContent value="delivered">
              <OrderTable orders={orders.filter(o => o.status === 'Delivered')} />
            </TabsContent>
            <TabsContent value="canceled">
              <OrderTable orders={orders.filter(o => o.status === 'Canceled')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderTable({ orders }: { orders: typeof import('@/lib/data').orders }) {
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
        {orders.map(order => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell>
              <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-accent text-accent-foreground' : ''}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        {orders.length === 0 && (
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
