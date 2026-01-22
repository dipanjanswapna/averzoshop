
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
import { cn } from '@/lib/utils';
import Link from 'next/link';

const onboardingSlides = [
  {
    icon: Sparkles,
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    title: "Discover Your Style",
    description: "Explore thousands of products from top brands and find what truly fits you.",
    image: "https://picsum.photos/seed/onboard1/800/1200",
    imageHint: "online shopping fashion",
  },
  {
    icon: Truck,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    title: "Fast & Reliable Delivery",
    description: "Get your favorite items delivered to your doorstep faster than you can imagine.",
    image: "https://picsum.photos/seed/onboard2/800/1200",
    imageHint: "delivery package shipping",
  },
  {
    icon: Gift,
    bgColor: "bg-pink-100",
    textColor: "text-pink-800",
    title: "Exclusive Offers & Deals",
    description: "Unlock special discounts, loyalty points, and deals exclusively for our members.",
    image: "https://picsum.photos/seed/onboard3/800/1200",
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

  const currentSlide = onboardingSlides[current];
  const Icon = currentSlide?.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Panel (Desktop) */}
        <div className={cn("relative hidden lg:flex flex-col items-center justify-center p-12 transition-colors duration-700", currentSlide?.bgColor)}>
             <motion.div 
                key={current} 
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={cn("p-4 rounded-full mb-6", currentSlide?.bgColor)}>
                    {Icon && <Icon size={48} className={currentSlide?.textColor}/>}
                </div>
                <h1 className={cn("text-4xl font-extrabold font-headline", currentSlide?.textColor)}>{currentSlide?.title}</h1>
                <p className={cn("mt-4 text-lg max-w-md opacity-80", currentSlide?.textColor)}>{currentSlide?.description}</p>
            </motion.div>
        </div>
        
        {/* Right Panel */}
        <div className="flex flex-col items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm">
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {onboardingSlides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-[9/16] relative w-full overflow-hidden rounded-2xl shadow-lg">
                                <Image 
                                    src={slide.image} 
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={slide.imageHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 text-white lg:hidden">
                                    <h2 className="text-3xl font-bold font-headline">{slide.title}</h2>
                                    <p className="mt-2 text-sm text-white/90">{slide.description}</p>
                                </div>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button key={index} onClick={() => api?.scrollTo(index)} className="p-1">
                            <motion.div
                                className={`h-2 rounded-full transition-all`}
                                animate={{ width: current === index ? 24 : 8, backgroundColor: current === index ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    ))}
                </div>

                <div className="w-full">
                    {isLastSlide ? (
                        <Link href={registerHref} passHref>
                           <Button size="lg" className="w-full h-12 text-base font-bold group">
                            Create Account <CheckCircle className="ml-2 h-5 w-5" />
                           </Button>
                        </Link>
                    ) : (
                        <Button size="lg" className="w-full h-12 text-base font-bold group" onClick={() => api?.scrollNext()}>
                            Next <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    )}
                     <Link href={welcomeHref}>
                        <Button variant="ghost" className="w-full mt-2 text-muted-foreground">Skip</Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
