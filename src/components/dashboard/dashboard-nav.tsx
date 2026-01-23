
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
  ClipboardList,
  ArrowRightLeft,
  BellRing,
  ImageIcon,
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
  { href: '/dashboard/pre-orders', label: 'Pre-orders', icon: ClipboardList },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/notifications', label: 'Notifications', icon: BellRing },
  { href: '/dashboard/vendors', label: 'Vendors', icon: Truck },
  { href: '/dashboard/stock-requests', label: 'Stock Requests', icon: ClipboardList },
  { href: '/dashboard/stock-transfers', label: 'Stock Transfers', icon: ArrowRightLeft },
  { href: '/dashboard/coupons', label: 'Coupons', icon: Tags },
  { href: '/dashboard/sub-brands', label: 'Sub-Brands', icon: Tags },
  { href: '/dashboard/outlets', label: 'Offline Outlets', icon: Building },
  { href: '/dashboard/appearance', label: 'Appearance', icon: ImageIcon },
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
              isActive={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
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
