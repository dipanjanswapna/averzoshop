
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  ShoppingCart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '#', label: 'Categories', icon: LayoutGrid },
  { href: '#', label: 'Bag', icon: ShoppingCart },
  { href: '/login', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map(item => {
          const isActive =
            (item.href === '/' && pathname === '/') ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-muted-foreground',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
