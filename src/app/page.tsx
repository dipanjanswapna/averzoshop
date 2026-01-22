'use client';
import { useState, useEffect } from 'react';
import SplashPage from './splash/page';
import OnboardingPage from './onboarding/page';
import WelcomePage from './welcome/page';
import StoreLayout from './(store)/layout';
import StoreFrontPage from './(store)/page';
import { useAuth } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase';

function InitialFlow() {
  const [step, setStep] = useState('splash'); // splash, onboarding, welcome
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('onboarding');
    }, 3000); // 3-second splash screen

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    setStep('welcome');
  };

  if (step === 'splash') {
    return <SplashPage />;
  }

  if (step === 'onboarding') {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  // step === 'welcome'
  return <WelcomePage />;
}

function MainApp() {
    return (
        <StoreLayout>
            <StoreFrontPage />
        </StoreLayout>
    )
}

function PageContent() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const visited = localStorage.getItem('hasVisitedAverzo');
    if (visited === null) {
      localStorage.setItem('hasVisitedAverzo', 'true');
      setIsFirstVisit(true);
    } else {
      setIsFirstVisit(false);
    }
  }, []);

  if (isFirstVisit === null || authLoading) {
    return <SplashPage />;
  }

  if (isFirstVisit) {
    return <InitialFlow />;
  }

  return <MainApp />;
}


export default function Page() {
    return (
        <FirebaseClientProvider>
            <PageContent />
        </FirebaseClientProvider>
    )
}
