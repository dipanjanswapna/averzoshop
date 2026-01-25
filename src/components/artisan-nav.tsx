
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Settings,
  Clock,
  Tags,
  Palette,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
    { href: '/artisan/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/artisan/products', label: 'My Products', icon: Palette },
    { href: '/artisan/pre-orders', label: 'Pre-orders', icon: Clock },
    { href: '/artisan/coupons', label: 'My Coupons', icon: Tags },
];

export function ArtisanNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={item.href === '/artisan/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
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
        <Link href="/artisan/settings">
            <SidebarMenuButton
            isActive={pathname === '/artisan/settings'}
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

    