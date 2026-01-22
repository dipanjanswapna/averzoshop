
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { NotificationBell } from './ui/notification-bell';

export function UserNav() {
  const { user, auth, userData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
      router.push('/login');
    }
  };
  
  const getDashboardLink = () => {
    switch (userData?.role) {
      case 'admin': return '/dashboard';
      case 'vendor': return '/vendor/dashboard';
      case 'outlet': return '/outlet/dashboard';
      case 'rider': return '/rider/dashboard';
      case 'sales': return '/sales/dashboard';
      case 'customer': return '/customer';
      default: return '/';
    }
  }

  if (!user) {
    return (
      <Link href="/welcome">
        <Button className="font-bold bg-gradient-to-r from-primary to-destructive text-primary-foreground hover:opacity-90 transition-all duration-300 transform hover:-translate-y-px shadow-lg hover:shadow-primary/40 rounded-full">
          Login
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User avatar'} />}
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  {userData?.role && <Badge variant="secondary" className="capitalize">{userData.role}</Badge>}
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             <DropdownMenuItem asChild>
               <Link href={getDashboardLink()}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
               </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
