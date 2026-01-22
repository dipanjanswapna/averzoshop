
"use client";
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import AverzoNavbar from '@/components/store-header';
import Link from 'next/link';
import Image from 'next/image';
import { CompareBar } from '@/components/compare/compare-bar';
import { CartExpirationChecker } from '@/components/cart/cart-expiration-checker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { LiveSearch } from '@/components/live-search';
import AverzoLogo from '@/components/averzo-logo';

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <AverzoNavbar />
      <CartExpirationChecker />
      <main className="flex-1 pt-[108px] pb-24 lg:pb-0">
        {children}
      </main>
      
      <footer className="hidden bg-secondary text-secondary-foreground lg:block">
        <div className="container py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center border-b pb-12">
            <div>
              <h2 className="text-3xl font-extrabold font-headline text-foreground">
                Stay Ahead of the Curve
              </h2>
              <p className="mt-2 text-muted-foreground">
                Subscribe to our newsletter for the latest fashion, deals, and updates.
              </p>
            </div>
            <form className="flex w-full max-w-md items-center space-x-2">
              <Input type="email" placeholder="Enter your email" className="bg-background h-12" />
              <Button type="submit" size="lg" className="h-12">Subscribe</Button>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 py-12">
            <div className="col-span-2">
              <AverzoLogo />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Averzo is your one-stop destination for fashion, electronics, and lifestyle products, offering a seamless B2B2D2C experience.
              </p>
              <div className="flex space-x-4 mt-6">
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin size={20} /></Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold font-headline text-foreground">Shop</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/mens-fashion" className="text-muted-foreground hover:text-primary">Men's Fashion</Link></li>
                <li><Link href="/womens-fashion" className="text-muted-foreground hover:text-primary">Women's Fashion</Link></li>
                <li><Link href="/kids-baby" className="text-muted-foreground hover:text-primary">Kids & Baby</Link></li>
                <li><Link href="/shop" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline text-foreground">About Us</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline text-foreground">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                <li><Link href="/track-order" className="text-muted-foreground hover:text-primary">Track Your Order</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
                <li><Link href="/install-pwa" className="text-muted-foreground hover:text-primary">Install App</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold font-headline text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">We Accept:</p>
              <div className="flex justify-center mb-6">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.sslcommerz.com/" title="SSLCommerz">
                      <Image
                          src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-03.png"
                          alt="SSLCommerz Payment Gateways"
                          width={1200}
                          height={171}
                      />
                  </a>
              </div>
              <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Averzo. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CompareBar />
      <MobileBottomNav />
    </div>
  );
}
