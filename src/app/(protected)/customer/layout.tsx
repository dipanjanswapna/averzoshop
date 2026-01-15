
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { CustomerNav } from '@/components/customer-nav';
import { UserNav } from '@/components/user-nav';
import AverzoLogo from '@/components/averzo-logo';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase/auth/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fallback protection: If loading is done and there's no user, redirect to login.
    // The middleware should handle this, but this is a safety net.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // While checking auth state, show a loading indicator.
  if (loading || !user) {
    return (
        <div className="flex h-screen items-center justify-center bg-sidebar text-sidebar-foreground">
            <p>Loading...</p>
        </div>
    );
  }
  
  // If user data is available, and the role is NOT customer, they don't belong here.
  // This can happen if an admin tries to manually navigate to /customer.
  // The main dashboard layout will handle redirecting them to the correct place.
  if (userData && userData.role !== 'customer') {
      return (
          <div className="flex h-screen items-center justify-center bg-background text-foreground">
              <p>Access Denied. Redirecting...</p>
          </div>
      )
  }

  // Render the customer dashboard
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <AverzoLogo className="h-8 w-auto" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <CustomerNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-sidebar">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 md:px-6">
            <SidebarTrigger className="flex text-sidebar-foreground md:hidden"/>
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search your account..."
                    className="w-full appearance-none bg-card pl-8 md:w-2/3 lg:w-1/3 text-card-foreground"
                  />
                </div>
              </form>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 text-sidebar-foreground">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
