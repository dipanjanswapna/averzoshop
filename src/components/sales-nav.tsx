'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  ShoppingCart,
  Package,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/sales/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sales/customers', label: 'My Customers', icon: Users },
  { href: '/sales/order', label: 'Place Order', icon: ShoppingCart },
  { href: '/sales/my-orders', label: 'My Orders', icon: Package },
];

export function SalesNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={item.href === '/sales/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
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
        <Link href="/sales/settings">
            <SidebarMenuButton
            isActive={pathname === '/sales/settings'}
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
