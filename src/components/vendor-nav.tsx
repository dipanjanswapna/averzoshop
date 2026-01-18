'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  Tags,
  Clock,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
    { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vendor/products', label: 'My Products', icon: Package },
    { href: '/vendor/stock-requests', label: 'Stock Requests', icon: ShoppingCart },
    { href: '/vendor/pre-orders', label: 'Pre-orders', icon: Clock },
    { href: '/vendor/challans', label: 'Delivery Challans', icon: FileText },
    { href: '/vendor/coupons', label: 'My Coupons', icon: Tags },
];

export function VendorNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href || (item.href !== '/vendor/dashboard' && pathname.startsWith(item.href))}
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
        <Link href="/vendor/settings">
            <SidebarMenuButton
            isActive={pathname === '/vendor/settings'}
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
