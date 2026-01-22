
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AverzoLogo from '@/components/averzo-logo';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
  const onboardingHref = redirect ? `/onboarding?redirect=${encodeURIComponent(redirect)}` : '/onboarding';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen font-body">
      <div className="relative hidden lg:block">
         <Image 
          src="/freestocks-_3Q3tsJ01nc-unsplash.jpg"
          alt="Welcome to Averzo"
          fill
          className="object-cover"
          data-ai-hint="fashion lifestyle abstract"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h1 className="text-5xl font-extrabold font-headline leading-tight">
                    The Future of<br/>Fashion & Retail.
                </h1>
                <p className="mt-4 text-lg max-w-lg text-white/80">
                    Join a community where style meets innovation. Discover curated collections and enjoy a seamless shopping experience.
                </p>
            </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <AverzoLogo className="text-4xl mx-auto mb-8" />
                <h2 className="text-3xl font-bold font-headline text-foreground">
                    Welcome to Averzo
                </h2>
                <p className="mt-3 text-muted-foreground">
                    Your journey to effortless style begins here. Sign in to continue or create an account to get started.
                </p>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-12 flex flex-col gap-4"
            >
                <Link href={loginHref}>
                    <Button size="lg" className="w-full h-14 text-base font-bold group">
                        <LogIn className="mr-2 h-5 w-5"/>
                        Sign In
                    </Button>
                </Link>
                <Link href={onboardingHref}>
                    <Button size="lg" variant="outline" className="w-full h-14 text-base font-bold group">
                         <UserPlus className="mr-2 h-5 w-5"/>
                        Create an Account
                    </Button>
                </Link>
            </motion.div>
             <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-xs text-muted-foreground mt-8"
            >
                By continuing, you agree to our <Link href="/terms-of-service" className="underline hover:text-primary">Terms of Service</Link>.
            </motion.p>
        </div>
      </div>
    </div>
  );
}
