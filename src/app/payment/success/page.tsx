
'use client';
import { Suspense } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function SuccessContent() {
    const searchParams = useSearchParams();
    const tran_id = searchParams.get('tran_id');
    const { firestore } = useFirebase();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tran_id && firestore) {
            const fetchOrder = async () => {
                setIsLoading(true);
                try {
                    const orderRef = doc(firestore, 'orders', tran_id);
                    const orderSnap = await getDoc(orderRef);
                    if (orderSnap.exists()) {
                        setOrder(orderSnap.data() as Order);
                    } else {
                        setError('Order not found. Your payment was successful, but we could not retrieve order details.');
                    }
                } catch (err) {
                    setError('Failed to retrieve order details.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrder();
        } else {
            setIsLoading(false);
        }
    }, [tran_id, firestore]);
    

    return (
        <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
            <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Payment Successful!</h1>
            <p className="mt-2 text-muted-foreground">
                Your order has been confirmed. You will receive an email shortly.
            </p>

            {isLoading && (
                <div className="mt-8 flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading order details...</p>
                </div>
            )}
            
            {error && <p className="mt-8 text-destructive">{error}</p>}
            
            {order && (
                <Card className="mt-8 w-full max-w-lg text-left">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>Order ID: <span className="font-mono">{order.id}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2 text-sm">
                            {order.items.map(item => (
                                <div key={item.variantSku} className="flex justify-between">
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                         </div>
                         <Separator />
                         <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>৳{(order.subtotal ?? order.totalAmount).toFixed(2)}</span>
                            </div>
                            {(order.discountAmount ?? 0) > 0 && (
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>- ৳{order.discountAmount!.toFixed(2)}</span>
                                </div>
                            )}
                             <div className="flex justify-between font-bold text-base">
                                <span>Total Paid</span>
                                <span>৳{order.totalAmount.toFixed(2)}</span>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            )}

            <div className="mt-8 flex gap-4">
                <Link href="/customer/my-orders">
                    <Button>View My Orders</Button>
                </Link>
                 <Link href="/shop">
                    <Button variant="outline">Continue Shopping</Button>
                </Link>
            </div>
        </div>
    );
}


export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
