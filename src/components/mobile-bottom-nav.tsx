
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

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: LayoutGrid },
  { href: '/cart', label: 'Bag', icon: ShoppingBag }, 
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/login', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getNavItem = (item: (typeof navItems)[0]) => {
     const isActive =
      (item.href === '/' && pathname === '/') ||
      (item.href !== '/' && pathname.startsWith(item.href));

    if (item.label === 'Bag') {
      return (
         <Link
            key={item.label}
            href={item.href}
            className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-muted-foreground',
                isActive && 'text-primary'
            )}
            >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
            {isMounted && items.length > 0 && (
                <span className="absolute top-0 right-3 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {items.length}
                </span>
            )}
        </Link>
      )
    }

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
