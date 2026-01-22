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
import { motion } from 'framer-motion';

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
  
  const protectedPrefixes = ['/dashboard', '/outlet', '/vendor', '/rider', '/sales'];
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

    return (
       <Link
            key={item.label}
            href={href}
            className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors duration-200 ease-in-out hover:text-primary',
                isActive && 'text-primary'
            )}
        >
            <div className="relative">
                {isActive && (
                    <motion.div
                        layoutId="active-nav-item"
                        className="absolute -inset-2.5 bg-primary/10 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                )}
                <div className="relative">
                    <item.icon className="h-6 w-6" />
                </div>
            </div>

            <span className={cn(
                "text-[10px] font-bold transition-opacity duration-200", 
                isActive ? 'opacity-100' : 'opacity-0 scale-95'
            )}>
                {item.label}
            </span>

            {item.label === 'Bag' && isMounted && items.length > 0 && (
                <span className="absolute top-0 right-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
            )}
        </Link>
    )
  }


  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm z-50 lg:hidden">
      <div className="grid h-16 grid-cols-5 bg-background/80 backdrop-blur-sm border rounded-full shadow-lg">
        {navItems.map(getNavItem)}
      </div>
    </nav>
  );
}
