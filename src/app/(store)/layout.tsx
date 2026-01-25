"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
import { useToast } from '@/hooks/use-toast';
import { subscribeToNewsletter } from '@/actions/subscription-actions';

// New Newsletter Form Component
const NewsletterForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await subscribeToNewsletter(values.email);
    if (result.success) {
      toast({
        title: 'Subscription Successful!',
        description: result.message,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: result.message,
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-md items-center space-x-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input type="email" placeholder="Enter your email" className="bg-background h-12" {...field} />
              </FormControl>
              <FormMessage className="text-xs pt-1" />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="h-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Subscribe'}
        </Button>
      </form>
    </Form>
  );
};


export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <AverzoNavbar />
      <CartExpirationChecker />
      <main className="flex-1 pt-[68px] lg:pt-[108px] pb-24 lg:pb-0">
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
            <NewsletterForm />
          </div>

          <div className="flex flex-wrap justify-between gap-8 py-12">
            <div className="flex-shrink-0">
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
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8 min-w-[300px]">
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
              <p className="text-xs text-muted-foreground mt-2">Averzo is a proud sister concern of the PRANGONS ECOSYSTEM.</p>
          </div>
        </div>
      </footer>

      <CompareBar />
      <MobileBottomNav />
    </div>
  );
}
