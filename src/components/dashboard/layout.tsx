'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import AverzoLogo from '@/components/averzo-logo';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { LiveSearch } from '../live-search';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  
  // This layout is now exclusively for admins.
  const allowedRoles = ['admin'];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <p>Loading dashboard...</p>
      </div>
    );
  }
  
  // If the user is not logged in, not an admin, or data is not yet available,
  // the protected layout will handle redirection. This is an extra layer of security.
  if (!user || !userData || !allowedRoles.includes(userData.role)) {
      return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <p>Access Denied. Redirecting...</p>
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
           <DashboardNav />
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
