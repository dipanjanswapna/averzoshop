
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { Providers } from '@/components/providers';
import { ToastProvider } from '@/components/ui/toast';

// export const metadata: Metadata = {
//   title: 'Averzo',
//   description: 'The future of fashion and retail.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showMobileNav = !pathname.startsWith('/dashboard');

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
      <body className={cn('font-body antialiased min-h-screen bg-background pb-16 lg:pb-0')}>
        <ToastProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ToastProvider>
        {showMobileNav && <MobileBottomNav />}
      </body>
    </html>
  );
}
