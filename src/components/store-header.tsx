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
import Image from 'next/image';

const categories = [
  {
    name: 'MEN',
    href: '#',
    promo: {
      title: "Men's Fashion",
      description: "Explore the latest trends in men's apparel and accessories.",
      image:
        'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmYXNoaW9uJTIwbWFsZSUyMG1vZGVsfGVufDB8fHx8MTc2ODQxMTEyN3ww&ixlib=rb-4.1.0&q=80&w=400',
    },
    sections: [
      {
        title: 'Topwear',
        links: [
          'T-Shirts',
          'Casual Shirts',
          'Polos',
          'Formal Shirts',
          'Sweatshirts',
        ],
      },
      {
        title: 'Bottomwear',
        links: ['Jeans', 'Chinos', 'Shorts', 'Trousers'],
      },
      {
        title: 'Accessories',
        links: ['Watches', 'Belts', 'Wallets', 'Sunglasses'],
      },
    ],
  },
  {
    name: 'WOMEN',
    href: '#',
    promo: {
      title: "Women's Fashion",
      description: 'Discover elegant styles for every occasion.',
      image:
        'https://images.unsplash.com/photo-1496302662116-35cc4f36df92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmYXNoaW9uJTIwd29tYW58ZW58MHx8fHwxNzY4MzI1OTY4fDA&ixlib=rb-4.1.0&q=80&w=400',
    },
    sections: [
      {
        title: 'Ethnic & Fusion Wear',
        links: ['Kurtas & Suits', 'Sarees', 'Lehengas', 'Ethnic Dresses'],
      },
      {
        title: 'Western Wear',
        links: [
          'Dresses',
          'Tops & T-shirts',
          'Jeans & Jeggings',
          'Skirts & Shorts',
        ],
      },
      {
        title: 'Footwear & Bags',
        links: ['Flats & Heels', 'Handbags', 'Sling Bags', 'Clutches'],
      },
    ],
  },
  { name: 'KIDS', href: '#' },
  { name: 'ELECTRONICS', href: '#' },
  {
    name: 'HEALTH & WELLNESS',
    href: '#',
    promo: {
        title: 'Health & Wellness',
        description: 'অর্গানিক খাবার, জিম সাপ্লিমেন্ট এবং পার্সোনাল কেয়ার ডিভাইস।',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Organic Food', links: ['Fruits', 'Vegetables', 'Grains', 'Honey'] },
        { title: 'Gym Supplements', links: ['Protein', 'Creatine', 'Vitamins'] },
        { title: 'Personal Care', links: ['Skincare', 'Haircare', 'Grooming Devices'] }
    ]
  },
  {
    name: 'PET ESSENTIALS',
    href: '#',
    promo: {
        title: 'Pet Essentials',
        description: 'পোষা প্রাণীর খাবার, গ্রুমিং কিট এবং খেলনা।',
        image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=1992&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Pet Food', links: ['Dog Food', 'Cat Food', 'Fish Food'] },
        { title: 'Grooming Kits', links: ['Brushes', 'Shampoos', 'Clippers'] },
        { title: 'Toys', links: ['Chew Toys', 'Interactive Toys'] }
    ]
  },
  {
    name: 'AUTOMOTIVE',
    href: '#',
    promo: {
        title: 'Automotive & Biking',
        description: 'বাইকের এক্সেসরিজ, হেলমেট, কার গ্যাজেট এবং টায়ার।',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Bike Accessories', links: ['Helmets', 'Gloves', 'Jackets'] },
        { title: 'Car Gadgets', links: ['Dashcams', 'Chargers', 'Holders'] },
        { title: 'Tires & Parts', links: ['Car Tires', 'Bike Tires', 'Engine Oil'] }
    ]
  },
    {
    name: 'STATIONERY',
    href: '#',
    promo: {
        title: 'Stationery & Hobby',
        description: 'অফিস সাপ্লাই, ড্রয়িং মেটেরিয়ালস এবং মিউজিক্যাল ইনস্ট্রুমেন্টস।',
        image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Office Supplies', links: ['Pens', 'Notebooks', 'Staplers'] },
        { title: 'Drawing Materials', links: ['Canvases', 'Paints', 'Brushes'] },
        { title: 'Musical Instruments', links: ['Guitars', 'Keyboards', 'Drums'] }
    ]
  },
  {
    name: 'GROCERIES',
    href: '#',
    promo: {
        title: 'Groceries & Daily',
        description: 'দ্রুত ডেলিভারির জন্য নিত্যপ্রয়োজনীয় পণ্য।',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Daily Needs', links: ['Rice', 'Lentils', 'Oil', 'Spices'] },
        { title: 'Snacks & Beverages', links: ['Chips', 'Juices', 'Soft Drinks'] },
        { title: 'Baby Care', links: ['Diapers', 'Baby Food', 'Wipes'] }
    ]
  },
    {
    name: 'TOOLS',
    href: '#',
    promo: {
        title: 'Industrial & Tools',
        description: 'হার্ডওয়্যার টুলস, সেফটি গিয়ার এবং ছোট মেশিনারি।',
        image: 'https://images.unsplash.com/photo-1518615345293-441a1443a9d9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Hardware Tools', links: ['Drills', 'Hammers', 'Screwdrivers'] },
        { title: 'Safety Gear', links: ['Helmets', 'Gloves', 'Goggles'] },
        { title: 'Machinery', links: ['Welding Machines', 'Power Saws'] }
    ]
  },
  {
    name: 'GIFTS',
    href: '#',
    promo: {
        title: 'Gifts & Flowers',
        description: 'গিফট বক্স, পার্সোনালাইজড আইটেম এবং ফুল।',
        image: 'https://images.unsplash.com/photo-1531747118684-6f3b0114c513?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    sections: [
        { title: 'Gift Boxes', links: ['Corporate Gifts', 'Birthday Boxes'] },
        { title: 'Personalized Items', links: ['Mugs', 'T-Shirts', 'Photo Frames'] },
        { title: 'Flowers', links: ['Roses', 'Orchids', 'Bouquets'] }
    ]
  },
];

const NavItem = ({
  category,
  children,
}: {
  category: (typeof categories)[0];
  children: React.ReactNode;
}) => (
  <div className="group static">
    {' '}
    {/* 'static' is important for the mega menu to span the full width */}
    <Link
      href={category.href}
      className="flex items-center gap-1 py-4 font-headline font-bold text-sm uppercase text-foreground hover:text-primary transition-colors"
    >
      {category.name}
    </Link>
    {/* --- Mega Menu Container (This is the fix for the cut-off issue) --- */}
    {category.sections && (
      <div className="absolute left-0 w-screen top-full bg-background/80 border-t shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40 backdrop-blur-sm">
        <div className="container mx-auto grid grid-cols-6 gap-8 p-10">
          {children}
        </div>
      </div>
    )}
  </div>
);

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
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
              {categories.map(category => (
                <NavItem key={category.name} category={category}>
                  {category.sections && (
                    <>
                      {/* Links Columns */}
                      {category.sections.map(section => (
                        <div key={section.title} className="col-span-1">
                          <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">
                            {section.title}
                          </h4>
                          <ul className="space-y-3 text-sm font-body">
                            {section.links.map(link => (
                              <li key={link}>
                                <Link
                                  href="#"
                                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-transform cursor-pointer block font-medium"
                                >
                                  {link}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Promo Section */}
                      <div className="col-span-2">
                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-secondary min-h-[150px]">
                          {category.promo?.image && (
                            <Image
                              src={category.promo.image}
                              alt={category.promo.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                            <h3 className="font-bold text-xl font-headline text-white">
                              {category.promo?.title}
                            </h3>
                            <p className="text-white/80 text-sm font-body">
                              {category.promo?.description}
                            </p>
                            <Button size="sm" className="mt-4 w-fit">
                              Shop Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </NavItem>
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
                  <AccordionItem
                    value={category.name.toLowerCase()}
                    key={category.name}
                  >
                    <AccordionTrigger className="font-bold text-base uppercase">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      {category.sections ? (
                        <Accordion
                          type="multiple"
                          className="w-full pl-4"
                        >
                          {category.sections.map(section => (
                            <AccordionItem
                              value={`${category.name.toLowerCase()}-${section.title.toLowerCase()}`}
                              key={section.title}
                            >
                              <AccordionTrigger>
                                {section.title}
                              </AccordionTrigger>
                              <AccordionContent className="pl-4">
                                <ul className="space-y-2 text-muted-foreground">
                                  {section.links.map(link => (
                                    <li
                                      key={link}
                                      className="hover:text-foreground"
                                    >
                                      <Link href="#">{link}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <p className="text-muted-foreground pl-4">
                          No sub-categories available.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-6 border-t pt-6">
                <Link href="#" className="font-bold text-base text-destructive">
                  SALE
                </Link>
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
