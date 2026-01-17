'use client';

import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { UserData } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface TopWishlistedProductsProps {
  products: Product[] | null;
  users: UserData[] | null;
  isLoading: boolean;
}

export function TopWishlistedProducts({ products, users, isLoading }: TopWishlistedProductsProps) {
  const topProducts = useMemo(() => {
    if (!products || !users) return [];

    const wishlistCounts = new Map<string, number>();
    users.forEach(user => {
      user.wishlist?.forEach(productId => {
        wishlistCounts.set(productId, (wishlistCounts.get(productId) || 0) + 1);
      });
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    return Array.from(wishlistCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, count]) => {
        const product = productMap.get(productId);
        return product ? { ...product, wishlistedCount: count } : null;
      })
      .filter((p): p is Product & { wishlistedCount: number } => p !== null);

  }, [products, users]);
  
  if (isLoading) {
    return (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Top Wishlisted Products</CardTitle>
            <CardDescription>The most popular items on your customers' wishlists.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-3/4" />
                             <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
    )
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Top Wishlisted Products</CardTitle>
        <CardDescription>
          The most popular items on your customers' wishlists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topProducts.length > 0 ? (
            <div className="space-y-4">
                {topProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-4">
                        <Image 
                            src={product.image || 'https://placehold.co/64'} 
                            alt={product.name} 
                            width={40} 
                            height={40}
                            className="rounded-md aspect-square object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{product.baseSku}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold">
                            <Heart size={16} className="fill-current" />
                            <span>{product.wishlistedCount}</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="flex items-center justify-center h-48 text-muted-foreground text-center border-2 border-dashed rounded-lg">
                <p>No products have been wishlisted yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
