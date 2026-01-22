import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AverzoLogo from '@/components/averzo-logo';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary p-4 text-center">
      <div className="absolute top-8">
        <AverzoLogo className="text-3xl" />
      </div>
      
      <div className="relative w-full max-w-sm aspect-square mb-8">
        <Image 
          src="https://picsum.photos/seed/welcome/600/600"
          alt="Welcome to Averzo"
          fill
          className="object-cover rounded-full shadow-2xl border-4 border-background"
          data-ai-hint="fashion lifestyle collage"
        />
      </div>

      <div className="max-w-md">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-foreground">
          Welcome to Averzo
        </h1>
        <p className="mt-4 text-muted-foreground">
          Discover the latest in fashion, electronics, and lifestyle. Your one-stop shop for everything you need.
        </p>
      </div>
      
      <div className="mt-10 flex flex-col gap-4 w-full max-w-xs">
         <Link href="/onboarding">
            <Button size="lg" className="w-full h-12 text-base">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </Link>
         <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
      </div>
    </div>
  );
}
