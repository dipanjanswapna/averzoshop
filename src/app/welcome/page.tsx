'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AverzoLogo from '@/components/averzo-logo';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8"
      >
        <AverzoLogo className="text-3xl" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 100 }}
        className="relative w-full max-w-sm aspect-square mb-8"
      >
        <Image 
          src="https://picsum.photos/seed/futuristic-welcome/800/800"
          alt="Welcome to Averzo"
          fill
          className="object-cover rounded-full shadow-2xl border-8 border-background"
          data-ai-hint="futuristic fashion abstract"
        />
         <div className="absolute inset-0 rounded-full ring-4 ring-primary/20 animate-pulse" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-md"
      >
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-foreground">
          Your Next Shopping Era
        </h1>
        <p className="mt-4 text-muted-foreground">
          Discover a curated world of fashion, tech, and lifestyle. Your one-stop shop for everything you need.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 flex flex-col gap-4 w-full max-w-xs"
      >
         <Link href="/onboarding">
            <Button size="lg" className="w-full h-12 text-base font-bold group bg-gradient-to-r from-primary to-destructive text-primary-foreground hover:opacity-90 transition-all duration-300 transform hover:-translate-y-px shadow-lg hover:shadow-primary/40">
                Get Started 
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
        </Link>
         <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
      </motion.div>
    </div>
  );
}
