
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Package,
  Heart,
  Settings,
  LayoutDashboard,
  Award,
  Star,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/customer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customer/profile', label: 'My Profile', icon: User },
  { href: '/customer/my-orders', label: 'My Orders', icon: Package },
  { href: '/customer/loyalty-points', label: 'Loyalty Points', icon: Award },
  { href: '/customer/subscription', label: 'Subscription', icon: Star },
  { href: '/customer/my-wishlist', label: 'My Wishlist', icon: Heart },
];

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={item.href === '/customer' ? pathname === item.href : pathname.startsWith(item.href)}
              tooltip={item.label}
              className="justify-start"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem className="mt-auto">
        <Link href="/customer/settings">
            <SidebarMenuButton
            isActive={pathname === '/customer/settings'}
            tooltip="Settings"
            className="justify-start"
            >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
            </SidebarMenuButton>
        </Link>
    </SidebarMenuItem>
    </SidebarMenu>
  );
}
