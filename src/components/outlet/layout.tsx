
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
import { useAuth } from '@/hooks/use-auth';
import { LiveSearch } from '../live-search';

export default function OutletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <p>Loading outlet dashboard...</p>
      </div>
    );
  }
  
  // This is a crucial check. If the user data is loaded and the role is NOT 'outlet',
  // we redirect them. The main protected layout will catch this and send them away.
  if (!user || (userData && userData.role !== 'outlet')) {
      return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <p>Redirecting...</p>
        </div>
      );
  }
  
  // If still loading or role is not yet confirmed, we can show a loader.
  // Once loading is false and the role is 'outlet', the main content will render.
  if (!userData) {
     return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <p>Verifying outlet account...</p>
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
           <OutletNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-sidebar">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 md:px-6">
            <SidebarTrigger className="flex text-sidebar-foreground md:hidden"/>
            <div className="w-full flex-1">
              <LiveSearch />
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 text-sidebar-foreground">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
