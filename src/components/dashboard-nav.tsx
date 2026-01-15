
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
  Store
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'outlet', 'vendor', 'rider'] },
  { href: '/dashboard/pos', label: 'Point of Sale', icon: Store, roles: ['admin', 'outlet'] },
  { href: '/dashboard/products', label: 'Products', icon: Package, roles: ['admin'] },
  { href: '/dashboard/orders', label: 'Orders & Delivery', icon: ShoppingCart, roles: ['admin', 'rider'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
  { href: '/dashboard/vendors', label: 'Vendors', icon: Truck, roles: ['admin', 'vendor'] },
  { href: '/dashboard/sub-brands', label: 'Sub-Brands', icon: Tags, roles: ['admin'] },
  { href: '/dashboard/outlets', label: 'Offline Outlets', icon: Building, roles: ['admin', 'outlet'] },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { userData } = useAuth();
  const userRole = userData?.role;

  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

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
