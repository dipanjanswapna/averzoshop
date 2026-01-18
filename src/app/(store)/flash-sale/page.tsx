
'use client';

import React, { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { FlashSalePageTimer } from '@/components/shop/flash-sale-page-timer';
import { FlashSaleProductCard } from '@/components/shop/flash-sale-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export default function FlashSalePage() {
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');

  const { saleProducts, saleEndDate } = useMemo(() => {
    if (!products) {
      return { saleProducts: [], saleEndDate: null };
    }

    const now = new Date();
    const activeSaleProducts = products.filter(p => 
      p.flashSale?.enabled && 
      p.flashSale.endDate && 
      (p.flashSale.endDate.toDate ? p.flashSale.endDate.toDate() : new Date(p.flashSale.endDate)) > now
    );

    if (activeSaleProducts.length === 0) {
      return { saleProducts: [], saleEndDate: null };
    }

    // Find the latest end date to use for the main timer
    const latestEndDate = activeSaleProducts.reduce((latest, p) => {
      const endDate = p.flashSale!.endDate.toDate ? p.flashSale!.endDate.toDate() : new Date(p.flashSale!.endDate);
      return endDate > latest ? endDate : latest;
    }, new Date(0));

    return { saleProducts: activeSaleProducts, saleEndDate: latestEndDate };
  }, [products]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-40 w-full mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!saleEndDate || saleProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-extrabold font-headline tracking-tight">No Flash Sale Active</h1>
        <p className="mt-2 text-muted-foreground">Check back later for more amazing deals!</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-destructive to-red-800 text-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center mb-8 shadow-2xl">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-extrabold font-headline uppercase tracking-wider">Flash Sale is Live!</h1>
            <p className="text-sm md:text-base opacity-90 mt-1">Grab it before it's gone. Exclusive deals, limited time only.</p>
          </div>
          <FlashSalePageTimer endDate={saleEndDate} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {saleProducts.map(product => (
            <FlashSaleProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
