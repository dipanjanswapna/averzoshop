
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Building,
  Tags,
  Settings,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders & Delivery', icon: ShoppingCart },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/vendors', label: 'Vendors', icon: Truck },
  { href: '/dashboard/sub-brands', label: 'Sub-Brands', icon: Tags },
  { href: '/dashboard/outlets', label: 'Offline Outlets', icon: Building },
];

export function DashboardNav() {
  const pathname = usePathname();
  
  // This nav is now only for Admins
  const navItems = adminNavItems;

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
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
        <Link href="/dashboard/settings">
            <SidebarMenuButton
            isActive={pathname === '/dashboard/settings'}
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
