
'use client';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
            <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Payment Successful!</h1>
            <p className="mt-2 text-muted-foreground">
                Your order has been confirmed. You will receive an email shortly.
            </p>
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
