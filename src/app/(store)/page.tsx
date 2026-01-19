'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
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
import { FlashSalePageTimer } from '@/components/shop/flash-sale-page-timer';

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

  const { featuredProducts, flashSaleProducts, flashSaleEndDate } = useMemo(() => {
    if (!products) return { approvedProducts: [], featuredProducts: [], flashSaleProducts: [], flashSaleEndDate: null };

    const approved = products.filter(p => p.status === 'approved' && p.total_stock > 0);
    const featured = approved.slice(0, 13);

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
      featuredProducts: featured, 
      flashSaleProducts: activeSaleProducts,
      flashSaleEndDate: latestEndDate 
    };

  }, [products]);


  const renderSkeleton = () => (
    [...Array(7)].map((_, i) => (
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
            </div>
        </section>
        
        {flashSaleProducts.length > 0 && flashSaleEndDate && (
          <section className="py-16">
              <div className="container">
                  <div className="bg-foreground text-background rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden relative">
                      <div className="relative z-10 text-center lg:text-left">
                          <h2 className="text-4xl font-extrabold uppercase flex items-center justify-center lg:justify-start gap-3">
                              <Zap className="text-primary" />
                              This Week's <br /> Must-Haves
                          </h2>
                          <p className="mt-2 text-background/70">
                            Trending Gadgets, Carefully Chosen for You
                          </p>

                          <div className="my-6 flex justify-center lg:justify-start">
                            <FlashSalePageTimer endDate={flashSaleEndDate} />
                          </div>

                          <Link href="/flash-sale">
                              <Button variant="outline" className="bg-transparent text-background border-background/50 hover:bg-background hover:text-foreground">
                                  Shop The Sale <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                          </Link>
                      </div>
                      <div className="relative">
                          <Carousel
                              opts={{
                                  align: "start",
                                  loop: flashSaleProducts.length > 3,
                              }}
                              className="w-full"
                          >
                              <CarouselContent className="-ml-2">
                                  {flashSaleProducts.map((product) => (
                                      <CarouselItem key={product.id} className="basis-full sm:basis-1/2 md:basis-1/3 pl-2">
                                          <ProductCard product={product} />
                                      </CarouselItem>
                                  ))}
                              </CarouselContent>
                              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/80 hover:bg-background text-foreground" />
                              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/80 hover:bg-background text-foreground" />
                          </Carousel>
                      </div>
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                  </div>
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
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {isLoading ? renderSkeleton() : featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
               <Link href="/shop" className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center">
                  <div className="flex flex-col items-center text-primary">
                    <ArrowRight className="h-8 w-8" />
                    <span className="font-bold mt-2">
                      View All
                    </span>
                  </div>
              </Link>
            </div>
          </div>
        </section>
      </>
  );
}
