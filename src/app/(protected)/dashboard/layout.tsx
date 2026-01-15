
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
import { useAuth } from '@/firebase/auth/use-auth.tsx';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData } = useAuth();

  // The root protected layout now handles loading and redirection.
  // This layout's only job is to render the admin UI if the user is authorized.
  
  // Render the admin dashboard for non-customer roles.
  // The outer layout ensures that if a customer lands here, they are redirected.
  if (!user || !userData || userData.role === 'customer') {
      // This state should ideally not be reached due to the root layout's logic,
      // but it's a good failsafe.
      return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <p>Access Denied. You are being redirected.</p>
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
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search the dashboard..."
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
