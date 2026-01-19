
'use client';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentFailPage() {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
            <XCircle className="h-24 w-24 text-destructive" />
            <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Payment Failed</h1>
            <p className="mt-2 text-muted-foreground">
                There was an issue processing your payment. Please try again.
            </p>
             <div className="mt-8 flex gap-4">
                <Link href="/checkout">
                    <Button>Try Again</Button>
                </Link>
                 <Link href="/shop">
                    <Button variant="outline">Continue Shopping</Button>
                </Link>
            </div>
        </div>
    );
}
