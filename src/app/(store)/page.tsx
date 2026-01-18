'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { ProductCard } from '@/components/product-card';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { FlashSaleProductCard } from '@/components/shop/flash-sale-product-card';
import { Button } from '@/components/ui/button';


const heroCarouselImages = PlaceHolderImages.filter(p =>
  p.id.startsWith('hero-carousel-')
);

export default function StoreFrontPage() {
  const { firestore } = useFirebase();
  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  const { data: products, isLoading } = useFirestoreQuery<Product>(productsQuery);

  const approvedProducts = products?.filter(p => p.status === 'approved' && p.total_stock > 0) || [];
  const featuredProducts = approvedProducts.slice(0, 4);

  const flashSaleProducts = useMemo(() => {
    if (!products) return [];
    const now = new Date();
    return products.filter(p => 
      p.status === 'approved' &&
      p.flashSale?.enabled && 
      p.flashSale.endDate && 
      (p.flashSale.endDate.toDate ? p.flashSale.endDate.toDate() : new Date(p.flashSale.endDate)) > now
    );
  }, [products]);

  const renderSkeleton = (count: number) => (
    [...Array(count)].map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 mt-2 w-3/4" />
        <Skeleton className="h-4 mt-1 w-1/2" />
      </div>
    ))
  );
    
  return (
    <>
        <section className="pb-8 md:pb-16">
          <div className="container">
            {/* --- Hero Carousel --- */}
            <div>
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                plugins={[
                    Autoplay({
                      delay: 4000,
                    }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {heroCarouselImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <Link href={image.link || '#'}>
                        <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-lg overflow-hidden">
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            data-ai-hint={image.imageHint}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <CarouselPrevious className="static -translate-y-0" />
                  <CarouselNext className="static -translate-y-0" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>

        {flashSaleProducts.length > 0 && (
          <section className="py-16 md:py-24 bg-red-50/50">
            <div className="container">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline text-3xl font-extrabold text-destructive flex items-center gap-2">
                  <Zap /> Flash Sale
                </h2>
                <Link href="/flash-sale">
                  <Button variant="ghost" className="flex items-center gap-2 text-destructive hover:text-destructive">
                    View All <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent className="-ml-4">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <CarouselItem key={i} className="basis-1/2 md:basis-1/4 lg:basis-1/5 pl-4">
                        <div className="space-y-2">
                          <Skeleton className="aspect-square w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-6 w-1/2" />
                        </div>
                      </CarouselItem>
                    ))
                  ) : flashSaleProducts.map(product => (
                    <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4">
                      <FlashSaleProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                <CarouselNext className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
              </Carousel>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-extrabold">
                Deals Of The Day
              </h2>
              <p className="mt-2 text-muted-foreground">
                Don't miss out on these limited-time offers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {isLoading ? renderSkeleton(4) : featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
                    <Link href="/shop" className="flex flex-col items-center">
                      <ArrowRight className="h-8 w-8 text-primary" />
                      <span className="font-bold text-primary mt-2">
                        View All
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </>
  );
}
