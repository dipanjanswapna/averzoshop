'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 text-center">
      <div className="max-w-md w-full">
        <Image
          src="https://i.postimg.cc/LgtF3mQ1/Blue-Screen-Loading-GIF-by-Fresh-Cake.gif"
          alt="404 Not Found"
          width={400}
          height={300}
          className="mx-auto rounded-lg"
          unoptimized // GIFs are not optimized by Next.js Image component
        />
        <h1 className="mt-8 text-4xl font-extrabold font-headline tracking-tight text-primary">
          Oops! Page Not Found
        </h1>
        <p className="mt-4 text-muted-foreground">
          It seems the page you are looking for has been moved, deleted, or never existed. Let's get you back on track.
        </p>
        <Link href="/" passHref>
          <Button className="mt-8">
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
