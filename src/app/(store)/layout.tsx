

import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import AverzoNavbar from '@/components/store-header';
import Link from 'next/link';
import { CompareBar } from '@/components/compare/compare-bar';

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <AverzoNavbar />
      <main className="flex-1 pt-[108px] pb-24 lg:pb-0">{children}</main>
      {/* --- Desktop Footer --- */}
      <footer className="bg-secondary text-secondary-foreground hidden lg:block">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="text-2xl font-black font-saira tracking-tighter text-foreground">
                AVERZO<span className="text-primary">.</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground font-body">
                The future of fashion and retail.
              </p>
            </div>
            <div>
              <h3 className="font-semibold font-headline">Shop</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li>
                  <Link
                    href="/shop"
                    className="text-muted-foreground hover:text-primary"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Men
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Women
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Kids
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline">About</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline">Support</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Shipping &amp; Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground font-body">
            <p>&copy; {new Date().getFullYear()} Averzo. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <CompareBar />
    </div>
  );
}
