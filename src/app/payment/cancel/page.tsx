
'use client';
import { Ban } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
            <Ban className="h-24 w-24 text-yellow-500" />
            <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">Payment Cancelled</h1>
            <p className="mt-2 text-muted-foreground">
                Your order has been cancelled. You can go back to your cart to review it.
            </p>
             <div className="mt-8 flex gap-4">
                <Link href="/cart">
                    <Button>Back to Cart</Button>
                </Link>
                 <Link href="/shop">
                    <Button variant="outline">Continue Shopping</Button>
                </Link>
            </div>
        </div>
    );
}
