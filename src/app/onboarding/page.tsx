
'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Gift, Sparkles, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

const onboardingSlides = [
  {
    icon: Sparkles,
    title: "Discover Your Unique Style",
    description: "Explore thousands of products from top brands and find what truly fits you.",
    image: "https://i.postimg.cc/Y9YRw12z/freestocks_3Q3ts_J01nc_unsplash.jpg",
    imageHint: "online shopping fashion",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    description: "Get your favorite items delivered to your doorstep faster than you can imagine.",
    image: "https://i.postimg.cc/GpZKNMRz/jon_ly_Xn7Gvim_Qrk8_unsplash.jpg",
    imageHint: "delivery package shipping",
  },
  {
    icon: Gift,
    title: "Exclusive Offers & Deals",
    description: "Unlock special discounts, loyalty points, and deals exclusively for our members.",
    image: "https://i.postimg.cc/MKDsTb0J/mike_petrucci_c9FQyq_IECds_unsplash.jpg",
    imageHint: "exclusive offer sale",
  },
];

export default function OnboardingPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const registerHref = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';
  const welcomeHref = redirect ? `/welcome?redirect=${encodeURIComponent(redirect)}` : '/welcome';

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  
  const isLastSlide = current === count - 1;

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const Icon = onboardingSlides[current].icon;

  return (
    <div className="flex flex-col h-screen lg:grid lg:grid-cols-2 bg-background font-body">
        {/* Content Panel (Left on Desktop, Bottom on Mobile) */}
        <div className="lg:order-1 flex flex-col p-8 flex-1">
            <div className="w-full max-w-md mx-auto flex flex-col justify-center flex-1">
                
                <div className="h-48 md:h-56 lg:h-64 relative">
                    <motion.div
                        key={current}
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 flex flex-col justify-center text-center lg:text-left items-center lg:items-start"
                    >
                        <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit">
                            <Icon size={32} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline text-foreground mt-4">
                            {onboardingSlides[current].title}
                        </h1>

                        <p className="mt-2 text-base text-muted-foreground">
                            {onboardingSlides[current].description}
                        </p>
                    </motion.div>
                </div>


                <div className="mt-auto pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center justify-center gap-2">
                            {Array.from({ length: count }).map((_, index) => (
                                <button key={index} onClick={() => api?.scrollTo(index)} className="p-1">
                                    <motion.div
                                        className={'h-2 rounded-full'}
                                        animate={{ width: current === index ? 32 : 8, backgroundColor: current === index ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            ))}
                        </div>
                        <Link href={welcomeHref} className="text-sm font-medium text-muted-foreground hover:text-primary">
                            Skip
                        </Link>
                    </div>

                    <motion.div
                        key={isLastSlide ? 'get-started' : 'next'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="w-full"
                    >
                        {isLastSlide ? (
                            <Link href={registerHref} passHref>
                                <Button size="lg" className="w-full h-14 text-base font-bold group">
                                    Get Started <CheckCircle className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Button size="lg" className="w-full h-14 text-base font-bold group" onClick={() => api?.scrollNext()}>
                                Next <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
        
        {/* Visuals Panel (Right on Desktop, Top on Mobile) */}
        <div className="lg:order-2 w-full aspect-square lg:aspect-auto lg:h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4 lg:p-8">
             <Carousel setApi={setApi} className="w-full h-full max-w-md lg:max-w-lg">
                <CarouselContent className="h-full">
                    {onboardingSlides.map((slide, index) => (
                    <CarouselItem key={index} className="h-full">
                        <div className="relative w-full h-full">
                            <Image 
                                src={slide.image} 
                                alt={slide.title}
                                fill
                                className="object-cover rounded-2xl shadow-2xl"
                                data-ai-hint={slide.imageHint}
                                priority={index === 0}
                            />
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    </div>
  );
}

