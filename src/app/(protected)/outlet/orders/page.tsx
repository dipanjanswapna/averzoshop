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
import { Button } from '@/components/ui/button';

const onlineOrders = [
    { id: 'ONL-001', customer: 'Rina Begum', items: 3, total: 1250, status: 'New', date: '2023-07-01' },
    { id: 'ONL-002', customer: 'Kamal Hossain', items: 1, total: 450, status: 'New', date: '2023-07-01' },
    { id: 'ONL-003', customer: 'Fatima Akter', items: 2, total: 850, status: 'Preparing', date: '2023-07-01' },
    { id: 'ONL-004', customer: 'John Doe', items: 5, total: 3200, status: 'Shipped', date: '2023-06-30' },
];

export default function OnlineOrdersPage() {

  const renderOrderTable = (orders: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? orders.map(order => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.items}</TableCell>
            <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
            <TableCell className="text-right">
                {order.status === 'New' && <Button size="sm">Accept Order</Button>}
                {order.status === 'Preparing' && <Button size="sm">Ready to Ship</Button>}
                {order.status === 'Shipped' && <Button size="sm" variant="outline" disabled>Handed Over</Button>}
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No orders in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Online Order Fulfillment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Online Orders</CardTitle>
          <CardDescription>Prepare and dispatch orders for D2C customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">New Orders</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="mt-4">
              {renderOrderTable(onlineOrders.filter(o => o.status === 'New'))}
            </TabsContent>
             <TabsContent value="preparing" className="mt-4">
              {renderOrderTable(onlineOrders.filter(o => o.status === 'Preparing'))}
            </TabsContent>
             <TabsContent value="shipped" className="mt-4">
              {renderOrderTable(onlineOrders.filter(o => o.status === 'Shipped'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
