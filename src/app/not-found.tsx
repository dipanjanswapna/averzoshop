'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Store, Truck } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 sm:p-6 md:p-8 text-center">
      <div className="max-w-lg w-full bg-background p-6 sm:p-8 rounded-2xl shadow-2xl border">
        <Image
          src="https://i.postimg.cc/1XTRPtpJ/Blue-Screen-Loading-GIF-by-Fresh-Cake.gif"
          alt="404 Not Found Animation"
          width={400}
          height={300}
          className="mx-auto rounded-lg"
          unoptimized
        />
        <h1 className="mt-8 text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-primary">
          Page Not Found
        </h1>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you may have typed the address incorrectly.
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/" passHref>
                <Button>
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                </Button>
            </Link>
            <Link href="/shop" passHref>
                <Button variant="outline">
                    <Store className="mr-2 h-4 w-4" />
                    Explore Shop
                </Button>
            </Link>
             <Link href="/track-order" passHref>
                <Button variant="outline">
                    <Truck className="mr-2 h-4 w-4" />
                    Track Order
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
