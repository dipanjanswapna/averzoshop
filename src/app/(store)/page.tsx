
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subBrands } from '@/lib/data';
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

const heroCarouselImages = PlaceHolderImages.filter(p =>
  p.id.startsWith('hero-carousel-')
);

export default function StoreFrontPage() {
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');

  const approvedProducts = products?.filter(p => p.status === 'approved' && p.total_stock > 0) || [];
  const featuredProducts = approvedProducts.slice(0, 4);

  const renderSkeleton = () => (
    [...Array(4)].map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 mt-2 w-3/4" />
        <Skeleton className="h-4 mt-1 w-1/2" />
      </div>
    ))
  );
    
  return (
    <>
        <section className="py-8 md:py-16">
          <div className="container">
            {/* --- Story Circles --- */}
            <div className="flex space-x-4 overflow-x-auto pb-4 md:justify-center">
              {subBrands.map(brand => (
                <Link
                  href="#"
                  key={brand.id}
                  className="flex flex-col items-center space-y-2 flex-shrink-0"
                >
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${brand.id}/100/100`}
                      alt={brand.name}
                    />
                    <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium font-body">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* --- Hero Carousel --- */}
            <div className="mt-8">
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
              {isLoading ? renderSkeleton() : featuredProducts.map(product => (
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
