
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

    if (userData) {
      if (userData.status !== 'approved') {
        return;
      }

      const isCustomer = userData.role === 'customer';
      const isOutlet = userData.role === 'outlet';
      
      const onAdminRoute = pathname.startsWith('/dashboard');
      const onCustomerRoute = pathname.startsWith('/customer');
      const onOutletRoute = pathname.startsWith('/outlet');

      if (isCustomer && !onCustomerRoute) {
        router.replace('/customer');
      } else if (isOutlet && !onOutletRoute) {
        router.replace('/outlet/dashboard');
      } else if (!isCustomer && !isOutlet && !onAdminRoute) {
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

  if (userData?.status === 'approved') {
    return <>{children}</>;
  }

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
