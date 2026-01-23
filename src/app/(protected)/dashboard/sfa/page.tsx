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
import {
  Briefcase,
  Users,
  ShoppingCart,
  DollarSign,
  User,
} from 'lucide-react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function SfaDashboardPage() {
  const { firestore } = useFirebase();

  const salesRepsQuery = useMemo(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'sales')) : null, [firestore]);
  const customersQuery = useMemo(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'customer')) : null, [firestore]);
  const ordersQuery = useMemo(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);

  const { data: salesReps, isLoading: repsLoading } = useFirestoreQuery<UserData>(salesRepsQuery);
  const { data: customers, isLoading: customersLoading } = useFirestoreQuery<UserData>(customersQuery);
  const { data: orders, isLoading: ordersLoading } = useFirestoreQuery<Order>(ordersQuery);

  const isLoading = repsLoading || customersLoading || ordersLoading;
  
  const {
    totalSalesReps,
    totalCustomers,
    todayFieldOrders,
    totalFieldSales,
    repPerformance
  } = useMemo(() => {
    if (!salesReps || !customers || !orders) {
        return { totalSalesReps: 0, totalCustomers: 0, todayFieldOrders: 0, totalFieldSales: 0, repPerformance: [] };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fieldOrders = orders.filter(o => o.salesRepId);
    
    const todayOrders = fieldOrders.filter(o => o.createdAt.toDate() >= today);
    const totalSales = fieldOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    const performance = salesReps.map(rep => {
        const repOrders = fieldOrders.filter(o => o.salesRepId === rep.uid);
        const repSales = repOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        return {
            ...rep,
            orderCount: repOrders.length,
            totalSales: repSales
        }
    });

    return {
        totalSalesReps: salesReps.length,
        totalCustomers: customers.length,
        todayFieldOrders: todayOrders.length,
        totalFieldSales: totalSales,
        repPerformance: performance.sort((a,b) => b.totalSales - a.totalSales)
    };
  }, [salesReps, customers, orders]);


  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Sales Force Automation (SFA) Dashboard</h1>
        </div>
        
      <div className="flex flex-wrap justify-center gap-4">
        <Card className="flex-1 min-w-[250px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Reps</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalSalesReps}</div>}
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[250px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalCustomers}</div>}
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[250px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Field Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{todayFieldOrders}</div>}
          </CardContent>
        </Card>
         <Card className="flex-1 min-w-[250px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Field Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">৳{totalFieldSales.toFixed(2)}</div>}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Sales Rep Performance</CardTitle>
            <CardDescription>Live performance metrics for your field sales team.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sales Rep</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead className="text-right">Total Sales Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        )) : repPerformance.map(rep => (
                            <TableRow key={rep.uid}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{rep.displayName}</div>
                                            <div className="text-sm text-muted-foreground">{rep.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{rep.orderCount}</TableCell>
                                <TableCell className="text-right font-medium">৳{rep.totalSales.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Mobile Cards */}
            <div className="flex flex-wrap justify-center gap-4 md:hidden">
              {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="flex-1 min-w-[280px] max-w-sm">
                      <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))
              ) : (
                repPerformance.map(rep => (
                    <Card key={rep.uid} className="flex-1 min-w-[280px] max-w-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{rep.displayName}</div>
                                    <div className="text-sm text-muted-foreground">{rep.email}</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Orders:</span>
                                <span className="font-bold">{rep.orderCount}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Sales:</span>
                                <span className="font-bold">৳{rep.totalSales.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))
              )}
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
