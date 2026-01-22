'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Truck, Gift, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AverzoLogo from '@/components/averzo-logo';

const onboardingSlides = [
  {
    key: 'discover',
    title: 'Discover Your Style',
    description: 'Explore thousands of products from top brands to find what truly fits you. Your next favorite outfit is just a tap away.',
    image: 'https://i.postimg.cc/Y9YRw12z/freestocks_3Q3ts_J01nc_unsplash.jpg',
    bgColor: 'bg-pink-100/50',
    textColor: 'text-pink-800',
    icon: Heart,
  },
  {
    key: 'delivery',
    title: 'Fast & Reliable Delivery',
    description: 'Get your orders delivered to your doorstep with our lightning-fast shipping. Track your package in real-time.',
    image: 'https://i.postimg.cc/GpZKNMRz/jon_ly_Xn7Gvim_Qrk8_unsplash.jpg',
    bgColor: 'bg-blue-100/50',
    textColor: 'text-blue-800',
    icon: Truck,
  },
  {
    key: 'offers',
    title: 'Exclusive Offers & Deals',
    description: 'Unlock special discounts, flash sales, and member-only perks. Save more on your favorite brands.',
    image: 'https://i.postimg.cc/MKDsTb0J/mike_petrucci_c9FQyq_IECds_unsplash.jpg',
    bgColor: 'bg-purple-100/50',
    textColor: 'text-purple-800',
    icon: Gift,
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (current < onboardingSlides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/register');
    }
  };

  const currentSlideData = onboardingSlides[current];
  const Icon = currentSlideData.icon;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 font-body">
      {/* Left side - Content */}
      <div className="flex flex-col justify-between p-8 md:p-12 order-2 lg:order-1">
        <div className="flex items-center justify-between">
            <AverzoLogo />
            <Button variant="ghost" onClick={() => router.push('/login')}>Skip</Button>
        </div>

        <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left my-10 lg:my-0"
        >
            <div className={cn("p-4 rounded-full mb-6", currentSlideData?.bgColor)}>
                <Icon size={48} className={currentSlideData?.textColor}/>
            </div>
            <h1 className="text-4xl font-extrabold font-headline text-foreground">{currentSlideData?.title}</h1>
            <p className="mt-4 text-lg max-w-md text-muted-foreground">{currentSlideData?.description}</p>
        </motion.div>
        
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            <div className="flex gap-2">
                {onboardingSlides.map((_, i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            current === i ? "bg-primary" : "bg-muted"
                        )}
                        animate={{ width: current === i ? 32 : 8 }}
                    />
                ))}
            </div>
            <Button 
                size="lg" 
                className="w-full lg:w-auto h-14 rounded-full group"
                onClick={nextSlide}
            >
                {current === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
        </div>
      </div>
      
      {/* Right side - Image Carousel */}
      <div className="relative min-h-[300px] lg:min-h-screen order-1 lg:order-2">
        <AnimatePresence initial={false}>
            <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
            >
                <Image
                    src={currentSlideData.image}
                    alt={currentSlideData.title}
                    fill
                    className="object-cover"
                    priority
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-none"></div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
