
'use client';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Check, Truck, Warehouse, Home } from 'lucide-react';
import type { Order } from '@/types/order';
import type { Outlet } from '@/types/outlet';
import { sendTargetedNotification } from '@/ai/flows/send-targeted-notification';

function DeliveryCard({ order, outlet, onAction, actionLabel, actionIcon: Icon, isLoading }: { order: Order, outlet: Outlet | undefined, onAction: (orderId: string) => void, actionLabel: string, actionIcon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Order ID: <span className="font-mono">{order.id.substring(0,8)}...</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                 {outlet && (
                    <div className="space-y-1">
                        <p className="font-bold text-primary flex items-center gap-2"><Warehouse className="h-4 w-4" /> Pickup From</p>
                        <p className="font-semibold">{outlet.name}</p>
                        <p className="text-muted-foreground">{outlet.location.address}</p>
                    </div>
                )}
                <div className="space-y-1">
                    <p className="font-bold text-foreground flex items-center gap-2"><Home className="h-4 w-4" /> Deliver To</p>
                    <p className="font-semibold">{order.shippingAddress?.name}</p>
                    <p className="text-muted-foreground">{order.shippingAddress?.streetAddress}, {order.shippingAddress?.area}, {order.shippingAddress?.district}</p>
                     <p className="text-muted-foreground">{order.shippingAddress?.phone}</p>
                </div>

                 <div className="flex items-center gap-2 pt-2 border-t">
                    <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-bold">৳{order.totalAmount.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onAction(order.id)} disabled={isLoading}>
                    <Icon className="mr-2 h-4 w-4" />
                    {actionLabel}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function RiderDeliveriesPage() {
    const { user, loading: authLoading } = useAuth();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const { data: allOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>('orders');
    const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');
    
    const isLoading = authLoading || ordersLoading || outletsLoading;

    const outletMap = useMemo(() => {
        if (!allOutlets) return new Map();
        return new Map(allOutlets.map(o => [o.id, o]));
    }, [allOutlets]);

    const availableDeliveries = useMemo(() => {
        if (!allOrders) return [];
        return allOrders.filter(o => o.status === 'ready_for_pickup');
    }, [allOrders]);
    
    const myDeliveries = useMemo(() => {
        if (!allOrders || !user) return [];
        return allOrders.filter(o => o.riderId === user.uid && o.status === 'out_for_delivery');
    }, [allOrders, user]);

    const handleAcceptDelivery = async (orderId: string) => {
        if (!firestore || !user) return;
        setUpdatingId(orderId);
        const orderRef = doc(firestore, 'orders', orderId);
        try {
            await updateDoc(orderRef, {
                status: 'out_for_delivery',
                riderId: user.uid,
            });
            toast({ title: "Delivery Accepted!", description: "The order is now in your delivery queue." });

            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const orderData = orderSnap.data() as Order;
                await sendTargetedNotification({
                    userId: orderData.customerId,
                    title: "Your order is on the way!",
                    body: `Rider ${user.displayName} has picked up your order #${orderId.substring(0,6)}.`,
                    link: `/track-order?id=${orderId}`
                });
            }

        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to accept delivery.'});
            console.error("Error accepting delivery:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMarkDelivered = async (orderId: string) => {
        setUpdatingId(orderId);
        try {
            const response = await fetch('/api/orders/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, newStatus: 'delivered' })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update status.');
            }
            toast({ title: "Delivery Complete!", description: "Great job on another successful delivery." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to update status.', description: error.message });
            console.error("Error marking delivered:", error);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const renderSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            ))}
        </div>
    );

    return (
         <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">My Deliveries</h1>
            <Tabs defaultValue="available">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Available for Pickup</TabsTrigger>
                    <TabsTrigger value="my_deliveries">My Active Deliveries</TabsTrigger>
                </TabsList>
                <TabsContent value="available" className="mt-4">
                     {isLoading ? renderSkeleton() : availableDeliveries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {availableDeliveries.map(order => (
                               <DeliveryCard 
                                    key={order.id}
                                    order={order}
                                    outlet={outletMap.get(order.assignedOutletId!)}
                                    onAction={handleAcceptDelivery}
                                    actionLabel="Accept & Pickup"
                                    actionIcon={Truck}
                                    isLoading={isLoading || updatingId === order.id}
                               />
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <h3 className="text-lg font-semibold">No deliveries available for pickup.</h3>
                            <p className="text-muted-foreground text-sm">Check back soon!</p>
                        </div>
                     )}
                </TabsContent>
                <TabsContent value="my_deliveries" className="mt-4">
                     {isLoading ? renderSkeleton() : myDeliveries.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {myDeliveries.map(order => (
                               <DeliveryCard 
                                    key={order.id}
                                    order={order}
                                    outlet={outletMap.get(order.assignedOutletId!)}
                                    onAction={handleMarkDelivered}
                                    actionLabel="Mark as Delivered"
                                    actionIcon={Check}
                                    isLoading={isLoading || updatingId === order.id}
                               />
                           ))}
                         </div>
                     ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <h3 className="text-lg font-semibold">You have no active deliveries.</h3>
                            <p className="text-muted-foreground text-sm">Accept a delivery from the "Available" tab.</p>
                        </div>
                     )}
                </TabsContent>
            </Tabs>
         </div>
    );
}

    
