
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
    if (loading) return; // Wait until auth state is determined

    if (!user) {
      // This should be handled by middleware, but as a fallback
      router.replace('/login');
      return;
    }
    
    // Once userData is loaded, perform role-based redirection
    if (userData) {
      const isCustomer = userData.role === 'customer';
      const onAdminDashboard = pathname.startsWith('/dashboard');
      const onCustomerDashboard = pathname.startsWith('/customer');

      if (isCustomer && onAdminDashboard) {
        router.replace('/customer');
      } else if (!isCustomer && onCustomerDashboard) {
        router.replace('/dashboard');
      }
    }

  }, [user, userData, loading, router, pathname]);

  // While loading auth state or user data, show a full-screen loader
  if (loading || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Loading user data...</p>
      </div>
    );
  }

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
