
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AverzoLogo from '@/components/averzo-logo';

export default function OnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="lds-ring">
                <div />
                <div />
                <div />
                <div />
            </div>
            <AverzoLogo className="text-xl" />
            <p className="text-muted-foreground animate-pulse">Redirecting to registration...</p>
        </div>
      </div>
  );
}
