'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { OutletNav } from '@/components/outlet-nav';
import { UserNav } from '@/components/user-nav';
import AverzoLogo from '@/components/averzo-logo';
import { Search, Warehouse } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';

export default function OutletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const isPosPage = pathname === '/outlet/pos';
  const { data: outletData, isLoading: outletLoading } = useFirestoreDoc<Outlet>(
    userData?.outletId ? `outlets/${userData.outletId}` : null
);
  
  if (loading || outletLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center justify-center gap-6">
              <div className="lds-ring">
                  <div />
                  <div />
                  <div />
                  <div />
              </div>
              <AverzoLogo className="text-xl" />
              <p className="text-muted-foreground animate-pulse">Loading outlet dashboard...</p>
          </div>
      </div>
    );
  }
  
  if (!user || (userData && userData.role !== 'outlet')) {
      return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <p>Redirecting...</p>
        </div>
      );
  }
  
  if (!userData) {
     return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="lds-ring">
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
                <AverzoLogo className="text-xl" />
                <p className="text-muted-foreground animate-pulse">Verifying outlet account...</p>
            </div>
        </div>
    );
  }
  
  const mainContent = (
    outletData && outletData.status === 'Inactive' ? (
      <main className="flex-1 p-4 md:p-6 text-sidebar-foreground flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-lg shadow-lg max-w-md">
          <Warehouse className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold font-headline text-card-foreground">Outlet Inactive</h1>
          <p className="text-muted-foreground mt-2">
            This outlet is currently inactive. All functionality, including Point of Sale and inventory management, is disabled.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Please contact an administrator for more information.
          </p>
        </div>
      </main>
    ) : (
      <main className={cn("flex-1 text-sidebar-foreground", !isPosPage && "p-4 md:p-6")}>
        {children}
      </main>
    )
  );

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <AverzoLogo className="h-8 w-auto" />
        </SidebarHeader>
        <SidebarContent className="p-2">
           <OutletNav />
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
                    placeholder="Search the outlet panel..."
                    className="w-full appearance-none bg-card pl-8 md:w-2/3 lg:w-1/3 text-card-foreground"
                  />
                </div>
              </form>
            </div>
            <UserNav />
        </header>
        {mainContent}
      </SidebarInset>
    </SidebarProvider>
  );
}
