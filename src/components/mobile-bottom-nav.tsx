

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Heart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: LayoutGrid },
  { href: '/cart', label: 'Bag', icon: ShoppingBag }, 
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/login', label: 'Profile', icon: User, protected: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const protectedPrefixes = ['/dashboard', '/outlet', '/vendor', '/rider'];
  const isAdminRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  // Also hide on customer dashboard for a cleaner experience there
  if (isAdminRoute || pathname.startsWith('/customer')) {
     return null;
  }

  const getNavItem = (item: (typeof navItems)[0]) => {
     const href = (item.protected && user) ? `/customer` : item.href;
     const isActive =
      (href === '/' && pathname === '/') ||
      (href !== '/' && pathname.startsWith(href));

    if (item.label === 'Bag') {
      return (
         <Link
            key={item.label}
            href={href}
            className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-muted-foreground',
                isActive && 'text-primary'
            )}
            >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
            {isMounted && items.length > 0 && (
                <span className="absolute top-0 right-3 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
            )}
        </Link>
      )
    }

    return (
       <Link
            key={item.label}
            href={href}
            className={cn(
                'flex flex-col items-center justify-center gap-1 text-muted-foreground',
                isActive && 'text-primary'
            )}
            >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
        </Link>
    )
  }


  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map(getNavItem)}
      </div>
    </nav>
  );
}
