
'use client';
import { FirebaseClientProvider } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import AverzoLogo from '@/components/averzo-logo';
import LayoutDebugger from '@/components/debug/LayoutDebugger';

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; 
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (userData) {
      // 1. Check for account approval status
      if (userData.status !== 'approved') {
        if (pathname !== '/pending-approval') {
           router.replace('/pending-approval');
        }
        return;
      }
      
      const onOnboardingRoute = pathname === '/onboarding';
      const hasAddress = userData.addresses && userData.addresses.length > 0;

      // For customers, handle onboarding/permissions flow
      if (userData.role === 'customer') {
        if (!hasAddress && !onOnboardingRoute) {
          // If customer has no address and is not on onboarding page, redirect there.
          router.replace('/onboarding');
          return;
        }
        if (hasAddress && onOnboardingRoute) {
          // If customer has address and tries to go to onboarding page, redirect away.
          router.replace('/customer');
          return;
        }
      } else if (onOnboardingRoute) {
        // If a non-customer lands on onboarding page, redirect them.
        router.replace('/');
        return;
      }
      
      // Role-based route protection for all other pages
      const isCustomer = userData.role === 'customer';
      const isOutlet = userData.role === 'outlet';
      const isVendor = userData.role === 'vendor';
      const isRider = userData.role === 'rider';
      const isAdmin = userData.role === 'admin';
      const isSales = userData.role === 'sales';
      
      const onAdminRoute = pathname.startsWith('/dashboard');
      const onCustomerRoute = pathname.startsWith('/customer');
      const onOutletRoute = pathname.startsWith('/outlet');
      const onVendorRoute = pathname.startsWith('/vendor');
      const onRiderRoute = pathname.startsWith('/rider');
      const onSalesRoute = pathname.startsWith('/sales');
      

      if (isCustomer && !onCustomerRoute && !onOnboardingRoute) {
        router.replace('/customer');
      } else if (isOutlet && !onOutletRoute) {
        router.replace('/outlet/dashboard');
      } else if (isVendor && !onVendorRoute) {
        router.replace('/vendor/dashboard');
      } else if (isRider && !onRiderRoute) {
        router.replace('/rider/dashboard');
      } else if (isSales && !onSalesRoute) {
        router.replace('/sales/dashboard');
      } else if (isAdmin && !onAdminRoute) {
        router.replace('/dashboard');
      }
    }
  }, [user, userData, loading, router, pathname]);


  if (loading || !user) {
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
          <p className="text-muted-foreground animate-pulse">Loading user data...</p>
        </div>
      </div>
    );
  }

  // User is logged in, but their data (role, status) might still be loading or they are unapproved.
  // The useEffect handles redirection, so we can show a generic loader here.
  if (!userData || userData.status !== 'approved') {
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
            <p className="text-muted-foreground animate-pulse">Verifying account status...</p>
          </div>
        </div>
      );
  }

  // This check ensures we only render children when user is fully authenticated and approved.
  return <>{children}</>;
}


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <ProtectedContent>{children}</ProtectedContent>
      <LayoutDebugger />
    </FirebaseClientProvider>
  );
}
