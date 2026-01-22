
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
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function OutletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const isPosPage = pathname === '/outlet/pos';
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="lds-ring">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <AverzoLogo className="absolute text-xl" />
                </div>
              <p className="text-muted-foreground animate-pulse">Loading outlet dashboard...</p>
          </div>
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
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="lds-ring">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <AverzoLogo className="absolute text-xl" />
                </div>
                <p className="text-muted-foreground animate-pulse">Verifying outlet account...</p>
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
        <main className={cn("flex-1 text-sidebar-foreground", !isPosPage && "p-4 md:p-6")}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
