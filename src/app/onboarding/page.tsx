'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const onboardingSlides = [
  {
    image: "https://picsum.photos/seed/onboard1/800/800",
    imageHint: "online shopping fashion",
    title: "Discover Your Style",
    description: "Explore thousands of products from top brands and find what truly fits you.",
  },
  {
    image: "https://picsum.photos/seed/onboard2/800/800",
    imageHint: "delivery package shipping",
    title: "Fast & Reliable Delivery",
    description: "Get your favorite items delivered to your doorstep faster than you can imagine.",
  },
  {
    image: "https://picsum.photos/seed/onboard3/800/800",
    imageHint: "exclusive offer sale",
    title: "Exclusive Offers & Deals",
    description: "Unlock special discounts, loyalty points, and deals exclusively for our members.",
  },
];

export default function OnboardingPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  
  const isLastSlide = current === count - 1;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-sm">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {onboardingSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <Card className="overflow-hidden border-none shadow-2xl">
                  <CardContent className="flex aspect-square items-center justify-center p-0 flex-col text-center">
                     <div className="relative w-full h-2/3">
                        <Image 
                          src={slide.image} 
                          alt={slide.title}
                          fill
                          className="object-cover"
                          data-ai-hint={slide.imageHint}
                         />
                     </div>
                     <div className="p-8 flex-1 flex flex-col justify-center">
                        <h2 className="text-2xl font-bold font-headline">{slide.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{slide.description}</p>
                     </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        
        <div className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
                <div 
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${current === index ? 'w-4 bg-primary' : 'bg-muted-foreground/30'}`}
                />
            ))}
        </div>

        {isLastSlide ? (
            <Link href="/shop" className="w-full">
                <Button size="lg" className="w-full h-12 text-base">
                    Let's Go Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        ) : (
             <Button size="lg" className="w-full h-12 text-base" onClick={() => api?.scrollNext()}>
                Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        )}
      </div>
    </div>
  );
}
