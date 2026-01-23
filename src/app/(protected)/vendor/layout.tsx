
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { VendorNav } from '@/components/vendor-nav';
import { UserNav } from '@/components/user-nav';
import AverzoLogo from '@/components/averzo-logo';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
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
              <p className="text-muted-foreground animate-pulse">Loading vendor dashboard...</p>
          </div>
      </div>
    );
  }
  
  if (!user || (userData && userData.role !== 'vendor')) {
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
                <p className="text-muted-foreground animate-pulse">Verifying vendor account...</p>
            </div>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <AverzoLogo className="h-8 w-auto" />
        </SidebarHeader>
        <SidebarContent className="p-2">
           <VendorNav />
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
                    placeholder="Search your products..."
                    className="w-full appearance-none bg-card pl-8 md:w-2/3 lg:w-1/3 text-card-foreground"
                  />
                </div>
              </form>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 text-sidebar-foreground overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
