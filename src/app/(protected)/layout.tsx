
'use client';
import { FirebaseClientProvider } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';


function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, auth } = useAuth();
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

    // This check is important to wait until user data (especially role) is loaded.
    if (userData) {
      if (userData.status !== 'approved') {
        // If not approved, they shouldn't access anything protected yet,
        // except the pending approval screen.
        return;
      }

      const isCustomer = userData.role === 'customer';
      const onAdminRoute = pathname.startsWith('/dashboard');
      const onCustomerRoute = pathname.startsWith('/customer');

      if (isCustomer && onAdminRoute) {
        // Customer trying to access a non-customer dashboard page
        router.replace('/customer');
      } else if (!isCustomer && onCustomerRoute) {
         // Non-customer (admin/vendor/etc.) trying to access customer-only page
        router.replace('/dashboard');
      }
    }
  }, [user, userData, loading, router, pathname]);

  const handleLogout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
      router.replace('/login');
    }
  };

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
            <Button onClick={handleLogout} variant="outline" className="mt-6">Logout</Button>
        </div>
      </div>
    )
  }

  // Render children only if loading is false and user is approved.
  // The useEffect above will handle redirection if the role/path is mismatched.
  if (userData?.status === 'approved') {
    return <>{children}</>;
  }

  // Fallback for edge cases where userData is still loading but status isn't 'approved' yet
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <p>Verifying account status...</p>
    </div>
  );
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
