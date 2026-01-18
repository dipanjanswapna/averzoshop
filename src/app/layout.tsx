'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { Providers } from '@/components/providers';
import { ToastProvider } from '@/components/ui/toast';
import React, { useState, useEffect } from 'react';
import { FcmHandler } from '@/components/fcm-handler'; // এই ফাইলটি টোকেন আপডেট হ্যান্ডেল করবে
import { useAuth } from '@/hooks/use-auth'; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth(); // Auth হুক থেকে ইউজার ডেটা নেওয়া

  useEffect(() => {
    setIsClient(true);
  }, []);

  // অ্যাডমিন এবং প্রোটেক্টেড রাউট ফিল্টারিং
  const protectedPrefixes = ['/dashboard', '/outlet', '/vendor', '/rider', '/customer', '/login', '/register'];
  const isAdminRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  const isPosPage = pathname === '/outlet/pos';

  // ন্যাভিগেশন বার দেখানোর লজিক
  const shouldShowNav = !isAdminRoute || isPosPage;
  const showMobileNav = isClient && shouldShowNav;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Averzo</title>
        <meta name="description" content="The future of fashion and retail." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Saira:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        'font-body antialiased min-h-screen bg-background',
        showMobileNav && 'pb-16 lg:pb-0'
      )}>
        <ToastProvider>
          <Providers>
            {/* FCM Handler: ইউজার লগইন থাকলে ব্যাকগ্রাউন্ডে টোকেন আপডেট করবে */}
            {isClient && user?.uid && <FcmHandler userId={user.uid} />}
            
            {children}
            
            {/* ফোরগ্রাউন্ড নোটিফিকেশন দেখানোর জন্য Toaster */}
            <Toaster />
          </Providers>
        </ToastProvider>

        {/* মোবাইল বটম ন্যাভিগেশন */}
        {showMobileNav && <MobileBottomNav />}
      </body>
    </html>
  );
}