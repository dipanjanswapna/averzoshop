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
import { motion, AnimatePresence } from 'framer-motion';

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
                'relative flex h-full flex-col items-center justify-center text-muted-foreground transition-colors duration-200 ease-in-out hover:text-primary',
                isActive && 'text-primary'
            )}
        >
            <motion.div 
              className="relative"
              animate={{ y: isActive ? -4 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <item.icon className="h-6 w-6" />
            </motion.div>
            
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>


            {item.label === 'Bag' && isMounted && items.length > 0 && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
            )}
        </Link>
    )
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 border-t bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map(getNavItem)}
      </div>
    </nav>
  );
}
