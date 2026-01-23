
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { SalesChart } from '@/components/sales-chart';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';
import type { Product } from '@/types/product';
import { ReplenishmentAdvisor } from '@/components/dashboard/replenishment-advisor';
import { TopWishlistedProducts } from '@/components/dashboard/top-wishlisted-products';


export default function DashboardPage() {
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

  const salesData = useMemo(() => {
    if (!orders) {
        const currentMonth = new Date().getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // Return last 6 months with 0 sales if no orders
        return Array(6).fill(0).map((_, i) => {
            const monthIndex = (currentMonth - 5 + i + 12) % 12;
            return { month: monthNames[monthIndex].slice(0,3), desktop: 0 };
        });
    }

    const monthlySales: {[key: string]: number} = {};
    
    orders.forEach(order => {
        if (order.createdAt && typeof order.createdAt.toDate === 'function') {
            const date = order.createdAt.toDate();
            const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
            
            if (!monthlySales[monthYear]) {
                monthlySales[monthYear] = 0;
            }
            monthlySales[monthYear] += order.totalAmount;
        }
    });

    const sortedMonths = Object.keys(monthlySales).sort((a, b) => {
        const [aMonth, aYear] = a.split('-');
        const [bMonth, bYear] = b.split('-');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    }).slice(-6); // Get last 6 months

    return sortedMonths.map(monthYear => ({
      month: monthYear.split('-')[0],
      desktop: monthlySales[monthYear],
    }));

  }, [orders]);


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-4">
        <Card className="flex-1 min-w-[280px] max-w-sm">
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
        <Card className="flex-1 min-w-[280px] max-w-sm">
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
        <Card className="flex-1 min-w-[280px] max-w-sm">
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
        <Card className="flex-1 min-w-[280px] max-w-sm">
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

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Sales Overview</CardTitle>
            <CardDescription>Sales performance over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <SalesChart data={salesData} />
          </CardContent>
        </Card>
        <TopWishlistedProducts products={products} users={users} isLoading={isLoading} />
      </div>
      
      <ReplenishmentAdvisor className="w-full" />
    </div>
  );
}
