
'use client';

import Link from 'next/link';
import { Heart, Search, ShoppingCart, User, Menu } from 'lucide-react';
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
    name: 'Eco & Sustainable',
    href: '#',
    sections: [
        { title: 'Eco Fashion', links: ['Recycled Apparel', 'Organic Cotton', 'Vegan Leather', 'Upcycled Bags'] },
        { title: 'Sustainable Home', links: ['Reusable Kitchenware', 'Solar Gadgets', 'Natural Cleaners', 'Bamboo Cutlery'] },
        { title: 'Personal Care', links: ['Zero-Waste Deodorant', 'Shampoo Bars', 'Bamboo Toothbrushes'] },
    ],
  },
  {
    name: 'Smart Home & IoT',
    href: '#',
    sections: [
        { title: 'Security', links: ['Smart Cams', 'Door Locks', 'Sensors', 'Video Doorbells'] },
        { title: 'Automation', links: ['Smart Bulbs', 'Hubs & Controllers', 'Smart Plugs', 'Voice Assistants'] },
        { title: 'Kitchen', links: ['Smart Fridges', 'Automated Coffee Makers', 'Smart Ovens'] },
        { title: 'Climate', links: ['Smart Thermostats', 'Air Purifiers'] },
    ],
  },
  {
    name: 'Gaming & Esports',
    href: '#',
    sections: [
        { title: 'PC Gaming', links: ['Graphic Cards', 'Monitors', 'RAM', 'Gaming PCs'] },
        { title: 'Peripherals', links: ['Keyboards', 'Mice', 'Headsets', 'Mousepads'] },
        { title: 'Consoles', links: ['PlayStation', 'Xbox', 'Nintendo Switch'] },
        { title: 'Streaming Gear', links: ['Webcams', 'Microphones', 'Capture Cards'] },
    ],
  },
  {
    name: 'Aura Grooming',
    href: '#',
    sections: [
        { title: 'Skincare', links: ['Cleansers', 'Serums', 'Moisturizers', 'Sunscreens'] },
        { title: 'Haircare', links: ['Shampoos', 'Conditioners', 'Styling Gels', 'Hair Dryers'] },
        { title: 'Professional Tools', links: ['Trimmers', 'Epilators', 'Facial Steamers'] },
    ],
  },
  {
    name: 'Artisan & Handmade',
    href: '#',
    sections: [
        { title: 'Home Decor', links: ['Pottery', 'Wall Hangings', 'Handmade Candles'] },
        { title: 'Fashion', links: ['Handwoven Sarees', 'Nakshi Kantha', 'Leather Goods'] },
        { title: 'Jewelry', links: ['Handcrafted Necklaces', 'Beaded Bracelets'] },
    ],
  },
  {
    name: 'Baby & Toddler',
    href: '#',
    sections: [
        { title: 'Diapering', links: ['Diapers', 'Wipes', 'Changing Mats'] },
        { title: 'Feeding', links: ['Baby Food', 'Bottles', 'High Chairs'] },
        { title: 'Gear', links: ['Strollers', 'Car Seats', 'Baby Carriers'] },
        { title: 'Nursery', links: ['Cribs', 'Monitors', 'Bedding'] },
    ],
  },
  {
    name: 'Musical Instruments',
    href: '#',
    sections: [
        { title: 'Guitars', links: ['Acoustic', 'Electric', 'Bass', 'Ukuleles'] },
        { title: 'Keyboards', links: ['Digital Pianos', 'Synthesizers', 'MIDI Controllers'] },
        { title: 'Drums & Percussion', links: ['Acoustic Kits', 'Electronic Kits', 'Cymbals'] },
        { title: 'Studio Gear', links: ['Microphones', 'Audio Interfaces', 'Monitors'] },
    ],
  },
];


const NavItem = ({
  category,
}: {
  category: (typeof categories)[0];
}) => (
  <div className="group static">
    <Link
      href={category.href}
      className="flex items-center gap-1 py-4 font-saira font-bold text-sm uppercase text-foreground hover:text-primary transition-colors"
    >
      {category.name}
    </Link>
    {category.sections && (
      <div className="absolute left-0 top-full w-screen bg-background/80 border-t shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40 backdrop-blur-sm">
        <div className="container mx-auto grid grid-cols-4 gap-8 p-10">
          {category.sections.map(section => (
            <div key={section.title} className="col-span-1">
              <h4 className="font-bold text-primary mb-4 uppercase font-saira text-sm tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm font-noto">
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
                <NavItem key={category.name} category={category} />
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
