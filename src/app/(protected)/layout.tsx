
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
      // If user's account is pending, don't allow access to dashboards
      if (userData.status !== 'approved') {
        // You might want to redirect to a specific "pending approval" page
        // For now, we'll just prevent further navigation and show a message.
        return;
      }

      const isCustomer = userData.role === 'customer';
      const onAdminRoute = pathname.startsWith('/dashboard');
      const onCustomerRoute = pathname.startsWith('/customer');

      if (isCustomer && onAdminRoute) {
        router.replace('/customer');
      } else if (!isCustomer && onCustomerRoute) {
        router.replace('/dashboard');
      }
    }
  }, [user, userData, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (userData && userData.status !== 'approved') {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Account Pending Approval</h1>
            <p className="text-muted-foreground">Your account is currently under review. We'll notify you once it's approved.</p>
        </div>
      </div>
    )
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
