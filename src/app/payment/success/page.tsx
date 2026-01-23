
'use client';
import { Suspense } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
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
        if (!tran_id || !firestore) {
            setIsLoading(false);
            setError("Invalid request. Transaction ID is missing.");
            return;
        }

        const orderRef = doc(firestore, 'orders', tran_id);

        const unsubscribe = onSnapshot(orderRef, (docSnap) => {
            if (docSnap.exists()) {
                const orderData = { id: docSnap.id, ...docSnap.data() } as Order;
                setOrder(orderData);
                
                if (orderData.status !== 'pending_payment') {
                    setIsLoading(false);
                    if (orderData.paymentStatus === 'Failed' || orderData.status === 'canceled') {
                        setError("There was an issue with your payment verification. Please contact support if the amount was deducted.");
                    }
                    unsubscribe();
                }
            } else {
                setError('Order not found. Your payment may have been successful, but we could not retrieve order details.');
                setIsLoading(false);
                unsubscribe();
            }
        }, (err) => {
            console.error("Error listening to order status:", err);
            setError('Failed to retrieve order details.');
            setIsLoading(false);
        });

        // Set a timeout to prevent indefinite loading
        const timeoutId = setTimeout(() => {
            if (isLoading) {
                setError("Payment confirmation is taking longer than expected. Please check 'My Orders' page or contact support.");
                setIsLoading(false);
                unsubscribe();
            }
        }, 30000); // 30 seconds timeout

        // Cleanup listener and timeout on component unmount
        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
        
    }, [tran_id, firestore]);

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
                <Loader2 className="h-24 w-24 animate-spin text-primary" />
                <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Processing Payment...</h1>
                <p className="mt-2 text-muted-foreground">
                    Please wait while we confirm your payment. Do not close this window.
                </p>
            </div>
        );
    }
    
    if (error || !order || order.paymentStatus === 'Failed' || order.status === 'canceled') {
        return (
             <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
                <XCircle className="h-24 w-24 text-destructive" />
                <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Payment Verification Failed</h1>
                <p className="mt-2 text-muted-foreground max-w-lg">
                    {error || "We couldn't confirm your payment automatically. Please check your 'My Orders' page for the final status or contact support if the amount was deducted from your account."}
                </p>
                 <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link href="/customer/my-orders"><Button>View My Orders</Button></Link>
                     <Link href="/"><Button variant="outline">Back to Home</Button></Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center text-center px-4 py-8">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
            <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Payment Successful!</h1>
            <p className="mt-2 text-muted-foreground">
                Your order has been confirmed. You will receive an email shortly.
            </p>
            
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
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>- ৳{order.discountAmount!.toFixed(2)}</span>
                            </div>
                        )}
                         <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                            <span>Total Paid</span>
                            <span>৳{order.totalAmount.toFixed(2)}</span>
                        </div>
                     </div>
                </CardContent>
            </Card>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
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
