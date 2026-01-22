
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Store,
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
  { href: '/shop', label: 'Shop', icon: Store },
  { href: '/cart', label: 'Bag', icon: ShoppingBag }, 
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/welcome', label: 'Profile', icon: User },
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

  if (isAdminRoute || pathname.startsWith('/customer')) {
     return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/80 backdrop-blur-lg lg:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const href = (item.label === 'Profile' && user) ? `/customer` : item.href;
          const isActive = (href === '/' && pathname === '/') || (href !== '/' && pathname.startsWith(href));

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'relative flex h-full flex-col items-center justify-center transition-colors duration-300 group',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <div className="relative">
                 <motion.div
                    animate={{ y: isActive ? -4 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                 >
                    <item.icon className="h-6 w-6" />
                </motion.div>
                {item.label === 'Bag' && isMounted && items.length > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }}
                  >
                    {items.reduce((acc, cartItem) => acc + cartItem.quantity, 0)}
                  </motion.span>
                )}
              </div>
              {isActive && (
                <motion.div
                  className="absolute bottom-1.5 h-1 w-6 rounded-full bg-primary"
                  layoutId="active-mobile-nav-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
