
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
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { SalesChart } from '@/components/sales-chart';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '../ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';
import type { Product } from '@/types/product';

export function AdminDashboard() {
  const { firestore } = useFirebase();

  const ordersQuery = useMemo(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const productsQuery = useMemo(() => firestore ? query(collection(firestore, 'products')) : null, [firestore]);

  const { data: orders, isLoading: ordersLoading } = useFirestoreQuery<Order>(ordersQuery);
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>(usersQuery);
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);

  const isLoading = ordersLoading || usersLoading || productsLoading;
  
  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;
  const newOrdersCount = orders?.length || 0;
  const totalProductsCount = products?.length || 0;
  const activeUsersCount = users?.filter(u => u.status === 'approved').length || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">৳{totalRevenue.toFixed(2)}</div>}
            <p className="text-xs text-muted-foreground">
              Based on all completed sales.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{newOrdersCount}</div>}
            <p className="text-xs text-muted-foreground">
              Total orders recorded.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalProductsCount}</div>}
            <p className="text-xs text-muted-foreground">
              Total products in the system.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{activeUsersCount}</div>}
            <p className="text-xs text-muted-foreground">
              Total approved user accounts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Orders</CardTitle>
            <CardDescription>
              Showing the last 5 recorded sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.shippingAddress.name || 'N/A'}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        ID: {order.id.substring(0,8)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className={order.status === 'delivered' ? 'bg-accent text-accent-foreground' : ''}>{order.status || 'Delivered'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
