
'use client';
import { FirebaseClientProvider } from '@/firebase';
import { useAuth } from '@/firebase/auth/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while auth state is loading
    if (loading) {
      return;
    }

    // If not logged in, redirect to login page.
    // This is a fallback, as middleware should handle this first.
    if (!user) {
      router.replace('/login');
      return;
    }

    // Once user data (with role) is loaded, perform role-based redirection.
    if (userData) {
      const isCustomer = userData.role === 'customer';
      const onAdminRoute = pathname.startsWith('/dashboard');
      const onCustomerRoute = pathname.startsWith('/customer');

      // If a customer is on an admin route, redirect them to the customer dashboard.
      if (isCustomer && onAdminRoute) {
        router.replace('/customer');
      } 
      // If a non-customer is on a customer route, redirect them to the admin dashboard.
      else if (!isCustomer && onCustomerRoute) {
        router.replace('/dashboard');
      }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading auth state or user data from Firestore, show a full-screen loader.
  // This prevents brief flashes of incorrect UI.
  if (loading || !user || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Loading user data...</p>
      </div>
    );
  }

  // If user and userData are loaded, render the appropriate content.
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
