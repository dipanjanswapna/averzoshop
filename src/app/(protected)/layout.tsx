
'use client';
import { FirebaseClientProvider } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

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
      if (userData.status !== 'approved') {
        if (pathname !== '/pending-approval') {
           router.replace('/pending-approval');
        }
        return;
      }

      const isCustomer = userData.role === 'customer';
      const isOutlet = userData.role === 'outlet';
      const isVendor = userData.role === 'vendor';
      const isRider = userData.role === 'rider';
      const isAdmin = userData.role === 'admin';
      
      const onAdminRoute = pathname.startsWith('/dashboard');
      const onCustomerRoute = pathname.startsWith('/customer');
      const onOutletRoute = pathname.startsWith('/outlet');
      const onVendorRoute = pathname.startsWith('/vendor');
      const onRiderRoute = pathname.startsWith('/rider');


      if (isCustomer && !onCustomerRoute) {
        router.replace('/customer');
      } else if (isOutlet && !onOutletRoute) {
        router.replace('/outlet/dashboard');
      } else if (isVendor && !onVendorRoute) {
        router.replace('/vendor/dashboard');
      } else if (isRider && !onRiderRoute) {
        router.replace('/rider/dashboard');
      } else if (isAdmin && !onAdminRoute) {
        router.replace('/dashboard');
      }
    }
  }, [user, userData, loading, router, pathname]);


  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <span className="loader"></span>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // User is logged in, but their data (role, status) might still be loading or they are unapproved.
  // The useEffect handles redirection, so we can show a generic loader here.
  if (!userData || userData.status !== 'approved') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-4">
            <span className="loader"></span>
            <p className="text-muted-foreground">Verifying account status...</p>
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
    </FirebaseClientProvider>
  );
}
