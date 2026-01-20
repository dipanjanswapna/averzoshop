'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SalesDashboardPage() {
  const { firestore } = useFirebase();
  const { user } = useAuth();

  const customersQuery = useMemo(() => user ? query(collection(firestore, 'users'), where('managedBy', '==', user.uid)) : null, [firestore, user]);
  const ordersQuery = useMemo(() => user ? query(collection(firestore, 'orders'), where('salesRepId', '==', user.uid)) : null, [firestore, user]);

  const { data: customers, isLoading: customersLoading } = useFirestoreQuery<UserData>(customersQuery);
  const { data: orders, isLoading: ordersLoading } = useFirestoreQuery<Order>(ordersQuery);

  const isLoading = customersLoading || ordersLoading;
  
  const {
    totalCustomers,
    totalOrders,
    totalSalesValue,
  } = useMemo(() => {
    if (!customers || !orders) {
        return { totalCustomers: 0, totalOrders: 0, totalSalesValue: 0 };
    }
    
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    return {
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalSalesValue: totalSales,
    };
  }, [customers, orders]);


  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
        </div>
        
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalCustomers}</div>}
             <Link href="/sales/customers"><Button variant="link" className="p-0 h-auto text-xs">View Customers</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Placed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalOrders}</div>}
             <Link href="/sales/order"><Button variant="link" className="p-0 h-auto text-xs">Place a New Order</Button></Link>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">৳{totalSalesValue.toFixed(2)}</div>}
            <p className="text-xs text-muted-foreground">Total value of orders you've placed.</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of your recent customer additions and orders.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">Activity log coming soon.</p>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
