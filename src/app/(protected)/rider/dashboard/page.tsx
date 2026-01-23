
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, CheckCircle, Package, ArrowRight, Home, Warehouse } from 'lucide-react';
import type { Order } from '@/types/order';
import type { Outlet } from '@/types/outlet';
import Link from 'next/link';

function RiderDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    
    const { data: allOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>('orders');
    const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

    const isLoading = authLoading || ordersLoading || outletsLoading;
    
    const outletMap = useMemo(() => {
        if (!allOutlets) return new Map();
        return new Map(allOutlets.map(o => [o.id, o]));
    }, [allOutlets]);

    const { myActiveDeliveries, myCompletedToday, availableForPickup } = useMemo(() => {
        if (!allOrders || !user) {
            return { myActiveDeliveries: [], myCompletedToday: 0, availableForPickup: 0 };
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active = allOrders.filter(o => o.riderId === user.uid && o.status === 'out_for_delivery');
        
        const completed = allOrders.filter(o => 
            o.riderId === user.uid && 
            o.status === 'delivered' && 
            o.updatedAt && o.updatedAt.toDate() >= today
        ).length;
        
        const available = allOrders.filter(o => o.status === 'ready_for_pickup').length;

        return { myActiveDeliveries: active, myCompletedToday: completed, availableForPickup: available };
    }, [allOrders, user]);
    
    if (isLoading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-9 w-48" />
                <div className="flex flex-wrap justify-center gap-6">
                  <Skeleton className="h-36 flex-1 min-w-[250px] max-w-sm" />
                  <Skeleton className="h-36 flex-1 min-w-[250px] max-w-sm" />
                  <Skeleton className="h-36 flex-1 min-w-[250px] max-w-sm" />
                </div>
                 <Skeleton className="h-64 w-full" />
              </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>

            <div className="flex flex-wrap justify-center gap-4">
                <Card className="flex-1 min-w-[250px] max-w-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myActiveDeliveries.length}</div>
                        <p className="text-xs text-muted-foreground">Currently on the road.</p>
                    </CardContent>
                </Card>
                <Card className="flex-1 min-w-[250px] max-w-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myCompletedToday}</div>
                         <p className="text-xs text-muted-foreground">Deliveries completed since midnight.</p>
                    </CardContent>
                </Card>
                <Card className="flex-1 min-w-[250px] max-w-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available for Pickup</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableForPickup}</div>
                         <Link href="/rider/deliveries"><Button variant="link" className="p-0 h-auto text-xs">View Available</Button></Link>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Active Deliveries</CardTitle>
                    <CardDescription>The list of orders you are currently delivering.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myActiveDeliveries.length > 0 ? (
                        <div className="space-y-4">
                            {myActiveDeliveries.map(order => (
                                <Card key={order.id} className="flex flex-col sm:flex-row items-start gap-4 p-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs text-muted-foreground">Order ID: <span className="font-mono">{order.id.substring(0,8)}...</span></p>
                                            <p className="font-bold text-primary">৳{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                         <div className="space-y-3 pt-2">
                                            <div className="flex items-start gap-3 text-sm">
                                                <div className="bg-muted p-2 rounded-full"><Warehouse size={16} className="text-muted-foreground" /></div>
                                                <div>
                                                    <p className="font-bold text-xs text-muted-foreground">FROM</p>
                                                    <p>{outletMap.get(order.assignedOutletId!)?.name}</p>
                                                </div>
                                            </div>
                                             <div className="flex items-start gap-3 text-sm">
                                                <div className="bg-muted p-2 rounded-full"><Home size={16} className="text-muted-foreground" /></div>
                                                 <div>
                                                    <p className="font-bold text-xs text-muted-foreground">TO</p>
                                                    <p>{order.shippingAddress?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.shippingAddress?.streetAddress}, {order.shippingAddress?.area}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full sm:w-auto">
                                        <Link href="/rider/deliveries">
                                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-48 border-2 border-dashed rounded-lg">
                            <Truck className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Active Deliveries</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Accept a delivery from the "My Deliveries" page.</p>
                             <Link href="/rider/deliveries" className="mt-4"><Button>Go to Deliveries</Button></Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default RiderDashboardPage;
