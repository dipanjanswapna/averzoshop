'use client';

import Link from 'next/link';
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AverzoLogo from '@/components/averzo-logo';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { subBrands } from '@/lib/data';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


const categories = [
  { 
    name: 'MEN', 
    href: '#',
    promo: {
        title: "Men's Fashion",
        description: "Explore the latest trends in men's apparel and accessories.",
        image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmYXNoaW9uJTIwbWFsZSUyMG1vZGVsfGVufDB8fHx8MTc2ODQxMTEyN3ww&ixlib=rb-4.1.0&q=80&w=400"
    },
    sections: [
        {
            title: "Topwear",
            links: ["T-Shirts", "Casual Shirts", "Polos", "Formal Shirts", "Sweatshirts"]
        },
        {
            title: "Bottomwear",
            links: ["Jeans", "Chinos", "Shorts", "Trousers"]
        },
        {
            title: "Accessories",
            links: ["Watches", "Belts", "Wallets", "Sunglasses"]
        }
    ]
  },
  { 
    name: 'WOMEN', 
    href: '#',
    promo: {
        title: "Women's Fashion",
        description: "Discover elegant styles for every occasion.",
        image: "https://images.unsplash.com/photo-1496302662116-35cc4f36df92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmYXNoaW9uJTIwd29tYW58ZW58MHx8fHwxNzY4MzI1OTY4fDA&ixlib=rb-4.1.0&q=80&w=400"
    },
     sections: [
        {
            title: "Ethnic & Fusion Wear",
            links: ["Kurtas & Suits", "Sarees", "Lehengas", "Ethnic Dresses"]
        },
        {
            title: "Western Wear",
            links: ["Dresses", "Tops & T-shirts", "Jeans & Jeggings", "Skirts & Shorts"]
        },
        {
            title: "Footwear & Bags",
            links: ["Flats & Heels", "Handbags", "Sling Bags", "Clutches"]
        }
    ]
  },
  { name: 'KIDS', href: '#' },
  { name: 'ELECTRONICS', href: '#' },
  { name: 'HEALTH & WELLNESS', href: '#' },
  { name: 'PET CARE', href: '#' },
];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        {/* --- DESKTOP HEADER --- */}
        <div className="hidden lg:block">
          {/* Top Bar */}
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center space-x-2">
                <AverzoLogo className="h-7 w-auto" />
              </Link>
            </div>
            <div className="flex-1 px-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products, brands and more"
                  className="w-full pl-9 bg-secondary border-none"
                />
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Profile</span>
                </Button>
              </Link>
              <Button variant="ghost" className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Wishlist</span>
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium">Bag</span>
              </Button>
            </nav>
          </div>
          {/* Category Bar */}
          <div className="border-t bg-background">
            <div className="container flex h-14 items-center justify-center space-x-6">
              {categories.map((category) => (
                <div key={category.name} className="group relative h-full flex items-center">
                  <Link
                    href={category.href}
                    className="flex items-center gap-1 font-bold text-sm uppercase tracking-wider text-foreground/70 hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>

                  {/* --- Mega Menu --- */}
                  {category.sections && (
                     <div className="absolute left-0 top-full w-screen max-w-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                        <div className="absolute left-0 w-full mt-px">
                            <div className="bg-background/80 shadow-lg border-t backdrop-blur-md">
                                <div className="container mx-auto px-4 py-8">
                                    <div className="grid grid-cols-6 gap-8">
                                        
                                        {/* Promo Section */}
                                        <div className="col-span-2 rounded-lg p-6 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-2xl font-headline text-primary uppercase">{category.promo?.title}</h3>
                                                <p className="text-muted-foreground mt-2 text-sm font-body">{category.promo?.description}</p>
                                            </div>
                                            <Button size="sm" className="mt-4 w-fit">Shop Now</Button>
                                        </div>
                                        
                                        {/* Links Columns */}
                                        {category.sections.map(section => (
                                            <div key={section.title} className="col-span-1">
                                                <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">{section.title}</h4>
                                                <ul className="space-y-3 text-sm">
                                                    {section.links.map(link => (
                                                        <li key={link} className="text-muted-foreground hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium font-body">{link}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}

                                        {/* Featured Brands & Promo Image */}
                                        <div className="col-span-2 grid grid-cols-1 gap-6">
                                             <div>
                                               <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">Featured Brands</h4>
                                               <div className="grid grid-cols-3 gap-4">
                                                  {subBrands.slice(0, 3).map(brand => (
                                                      <div key={brand.id} className="flex flex-col items-center text-center gap-2 cursor-pointer group/brand">
                                                          <Avatar className="h-16 w-16 border-2 border-transparent group-hover/brand:border-primary transition-colors">
                                                            <AvatarImage src={`https://picsum.photos/seed/${brand.id}/100/100`} alt={brand.name} />
                                                            <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
                                                          </Avatar>
                                                          <p className="font-semibold text-xs font-body">{brand.name}</p>
                                                      </div>
                                                  ))}
                                               </div>
                                            </div>
                                             <div className="relative w-full h-full rounded-lg overflow-hidden bg-secondary min-h-[150px]">
                                                {category.promo?.image && (
                                                  <Image
                                                    src={category.promo.image}
                                                    alt="Ad campaign"
                                                    layout="fill"
                                                    objectFit="cover"
                                                  />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                                                    <p className="text-white font-bold text-lg font-headline">New Arrivals</p>
                                                    <p className="text-white/80 text-sm font-body">Up to 30% off</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- MOBILE & TABLET HEADER --- */}
        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <Link href="/">
            <AverzoLogo className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* --- MOBILE SIDEBAR / DRAWER --- */}
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="p-4 border-b">
              <AverzoLogo className="h-7 w-auto" />
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <Accordion type="multiple" className="w-full">
                {categories.map(category => (
                    <AccordionItem value={category.name.toLowerCase()} key={category.name}>
                        <AccordionTrigger className="font-bold text-base uppercase">{category.name}</AccordionTrigger>
                        <AccordionContent>
                           {category.sections ? (
                             <Accordion type="multiple" className="w-full pl-4">
                                {category.sections.map(section => (
                                    <AccordionItem value={`${category.name.toLowerCase()}-${section.title.toLowerCase()}`} key={section.title}>
                                        <AccordionTrigger>{section.title}</AccordionTrigger>
                                        <AccordionContent className="pl-4">
                                        <ul className="space-y-2 text-muted-foreground">
                                            {section.links.map(link => (
                                                 <li key={link} className="hover:text-foreground"><Link href="#">{link}</Link></li>
                                            ))}
                                        </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                           ) : (
                             <p className="text-muted-foreground pl-4">No sub-categories available.</p>
                           )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-6 border-t pt-6">
                <Link href="#" className="font-bold text-base text-destructive">SALE</Link>
              </div>
            </div>
            <div className="p-4 border-t mt-auto bg-background">
              <Link href="/login">
                <Button className="w-full">Login / Sign Up</Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}