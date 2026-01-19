
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
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
import type { StoreAsset } from '@/types/store-asset';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FlashSalePageTimer } from '@/components/shop/flash-sale-page-timer';
import ForYouProducts from '@/components/for-you-products';


export default function StoreFrontPage() {
  const { firestore } = useFirebase();
  
  const assetsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'store_assets'), where('categorySlug', '==', 'home'));
  }, [firestore]);

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: assets, isLoading: assetsLoading } = useFirestoreQuery<StoreAsset>(assetsQuery);
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);
  
  const isLoading = assetsLoading || productsLoading;
  
  const heroCarouselImages = useMemo(() => assets?.filter(a => a.assetType === 'hero-carousel') || [], [assets]);

  const { flashSaleProducts, flashSaleEndDate } = useMemo(() => {
    if (!products) return { flashSaleProducts: [], flashSaleEndDate: null };

    const approved = products.filter(p => p.status === 'approved' && p.total_stock > 0);

    const now = new Date();
    const activeSaleProducts = approved.filter(p => 
      p.flashSale?.enabled && 
      p.flashSale.endDate && 
      (p.flashSale.endDate.toDate ? p.flashSale.endDate.toDate() : new Date(p.flashSale.endDate)) > now
    );
    
    let latestEndDate: Date | null = null;
    if (activeSaleProducts.length > 0) {
      latestEndDate = activeSaleProducts.reduce((latest, p) => {
        const endDate = p.flashSale!.endDate.toDate ? p.flashSale!.endDate.toDate() : new Date(p.flashSale!.endDate);
        return endDate > latest ? endDate : latest;
      }, new Date(0));
    }

    return { 
      flashSaleProducts: activeSaleProducts,
      flashSaleEndDate: latestEndDate 
    };

  }, [products]);
  
  const renderSkeleton = (count: number) => (
    [...Array(count)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-4 mt-2 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    ))
  );
    
  return (
    <>
        <section className="w-full">
            <div className="container">
              {isLoading ? (
                  <Skeleton className="w-full aspect-[16/9] md:aspect-[2.5/1] rounded-xl" />
              ) : (
                <Carousel
                  opts={{ align: 'start', loop: true }}
                  plugins={[ Autoplay({ delay: 4000 }) ]}
                  className="w-full"
                >
                  <CarouselContent>
                    {heroCarouselImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <Link href={image.link || '#'}>
                          <div className="relative w-full aspect-[16/9] md:aspect-[2.5/1] rounded-xl overflow-hidden">
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
              )}
            </div>
        </section>
        
        {flashSaleProducts.length > 0 && flashSaleEndDate && (
          <section className="py-2 md:py-4">
            <div className="container">
              <div className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 text-white rounded-2xl p-4 shadow-2xl overflow-hidden relative flex flex-col lg:flex-row items-center gap-4">
                
                <div className="absolute -top-10 -left-20 w-24 h-24 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-20 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 text-center lg:text-left lg:w-3/5 shrink-0">
                  <h2 className="text-xl md:text-3xl font-extrabold uppercase font-headline tracking-wider flex items-center justify-center lg:justify-start gap-2">
                    <Zap size={20} className="text-yellow-300"/>
                    This Week's Must-Haves
                  </h2>
                  <p className="mt-1 text-sm md:text-base text-white/80 max-w-lg mx-auto lg:mx-0">
                    Trending Gadgets, Carefully Chosen for You.
                  </p>
                  
                  {flashSaleEndDate && (
                    <div className="my-2 flex justify-center lg:justify-start">
                      <FlashSalePageTimer endDate={flashSaleEndDate} />
                    </div>
                  )}

                  <Link href="/flash-sale">
                    <Button size="sm" className="bg-white/90 text-black hover:bg-white shadow-lg transform hover:scale-105 h-10 text-sm px-5">
                      Shop The Sale <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="relative z-10 w-full lg:w-3/5">
                  <Carousel
                      opts={{
                          align: "start",
                          loop: flashSaleProducts.length > 4,
                      }}
                      className="w-full"
                  >
                      <CarouselContent className="-ml-2 md:-ml-4">
                          {flashSaleProducts.map((product) => (
                              <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4 pl-2 md:pl-4">
                                  <ProductCard product={product} />
                              </CarouselItem>
                          ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/80 hover:bg-white text-black h-8 w-8" />
                      <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/80 hover:bg-white text-black h-8 w-8" />
                  </Carousel>
                </div>
              </div>
            </div>
          </section>
        )}

       <ForYouProducts />
      </>
  );
}

  