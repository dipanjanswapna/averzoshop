
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap, ChevronRight } from 'lucide-react';
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
        <section className="py-4 md:py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
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
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl">
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
        </section>

        {flashSaleProducts.length > 0 && (
          <section className="py-6 md:py-8">
            <div className="container px-4 md:px-6 lg:px-8">
               <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-xl grid grid-cols-1 lg:grid-cols-5 gap-6 items-center shadow-2xl p-8">
                <div className="text-white lg:col-span-1 text-center lg:text-left">
                  <h2 className="text-2xl lg:text-3xl font-extrabold uppercase leading-tight font-headline">This Week's<br/>Must-Have</h2>
                  <p className="mt-4 text-lg text-slate-300">Trending Gadgets, Carefully Chosen for You</p>
                  <Link href="/flash-sale">
                    <Button variant="secondary" className="mt-6 bg-white text-black hover:bg-gray-200 rounded-md px-6 py-3 group">
                      Go Shopping <span className="ml-2 font-bold transition-transform group-hover:translate-x-1">&raquo;</span>
                    </Button>
                  </Link>
                </div>
                <div className="lg:col-span-4 relative">
                  <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent className="-ml-3">
                      {isLoading ? (
                        [...Array(4)].map((_, i) => (
                          <CarouselItem key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-3">
                            <div className="bg-white p-4 rounded-lg space-y-2">
                              <Skeleton className="aspect-square w-full" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-6 w-1/2" />
                            </div>
                          </CarouselItem>
                        ))
                      ) : flashSaleProducts.slice(0, 8).map(product => ( 
                        <CarouselItem key={product.id} className="basis-1/2 md:basis-1/4 pl-3">
                          <ProductCard product={product} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 shadow-md" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 shadow-md" />
                  </Carousel>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-extrabold">
                Deals Of The Day
              </h2>
              <p className="mt-2 text-muted-foreground">
                Don't miss out on these limited-time offers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-5 md:grid-cols-4 lg:grid-cols-5">
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
