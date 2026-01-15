
'use client';

import Link from 'next/link';
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';


const categories = [
    {
    name: 'All Categories',
    href: '#',
    featured: true,
    megaMenu: {
      type: 'grid',
      items: [
        { name: "Men's Fashion", href: '#' },
        { name: "Women's Fashion", href: '#' },
        { name: 'Electronics & Gadgets', href: '#' },
        { name: 'Kids & Baby', href: '#' },
        { name: 'Beauty & Personal Care', href: '#' },
        { name: 'Home & Living', href: '#' },
        { name: 'Health & Wellness', href: '#' },
        { name: 'Gaming & Esports', href: '#' },
        { name: 'Pet Care', href: '#' },
        { name: 'Sports & Outdoors', href: '#' },
        { name: 'Smart Home & IoT', href: '#' },
        { name: 'Automotive & Biking', href: '#' },
        { name: 'Books & Stationery', href: '#' },
        { name: 'Artisan & Handicrafts', href: '#' },
        { name: 'Travel & Luggage', href: '#' },
        { name: 'Eco-Friendly Living', href: '#' },
        { name: 'Musical Instruments', href: '#' },
        { name: 'Gifts & Celebrations', href: '#' },
        { name: 'Daily Essentials', href: '#' },
      ],
    },
  },
  {
    name: "Men's Fashion",
    href: '#',
    sections: [
      {
        title: 'Topwear',
        links: ['T-Shirts', 'Casual Shirts', 'Formal Shirts', 'Polos'],
      },
      {
        title: 'Bottomwear',
        links: ['Jeans', 'Chinos', 'Trousers', 'Shorts'],
      },
      {
        title: 'Ethnic Wear',
        links: ['Panjabi', 'Pajama', 'Koti'],
      },
      {
        title: 'Accessories',
        links: ['Watches', 'Belts', 'Wallets', 'Sunglasses'],
      },
    ],
  },
  {
    name: "Women's Fashion",
    href: '#',
    sections: [
      {
        title: 'Saree',
        links: ['Cotton', 'Silk', 'Jamdani', 'Georgette'],
      },
      {
        title: 'Salwar Kameez',
        links: ['Unstitched', 'Stitched', 'Three Piece'],
      },
      {
        title: 'Western Wear',
        links: ['Tops', 'Dresses', 'Jeans', 'Skirts'],
      },
      {
        title: 'Bags & Accessories',
        links: ['Handbags', 'Clutches', 'Jewelry', 'Scarves'],
      },
    ],
  },
  {
    name: 'Electronics & Gadgets',
    href: '#',
    sections: [
      {
        title: 'Computers',
        links: ['Laptops', 'Desktops', 'Monitors', 'Gaming PCs'],
      },
      {
        title: 'Mobile & Tablets',
        links: ['Smartphones', 'Tablets', 'Feature Phones', 'Accessories'],
      },
      {
        title: 'Cameras',
        links: ['DSLR', 'Mirrorless', 'Action Cams', 'Drones'],
      },
      {
        title: 'Smart Devices',
        links: ['Smartwatches', 'Fitness Trackers', 'Smart Speakers'],
      },
    ],
  },
  {
    name: 'Kids & Baby',
    href: '#',
    sections: [
      {
        title: 'Baby Care',
        links: ['Diapers', 'Wipes', 'Baby Food', 'Skincare'],
      },
      {
        title: 'Kids Fashion',
        links: ["Boys' Clothing", "Girls' Clothing", 'Footwear'],
      },
      { title: 'Toys & Games', links: ['Action Figures', 'Educational Toys'] },
      { title: 'Nursery', links: ['Cribs', 'Strollers', 'Car Seats'] },
    ],
  },
  {
    name: 'Beauty & Personal Care',
    href: '#',
    sections: [
      { title: 'Skincare', links: ['Cleansers', 'Moisturizers', 'Serums'] },
      { title: 'Makeup', links: ['Foundation', 'Lipstick', 'Mascara'] },
      { title: 'Hair Care', links: ['Shampoo', 'Conditioner', 'Hair Oil'] },
      { title: 'Fragrances', links: ['Perfumes', 'Body Mists'] },
    ],
  },
  {
    name: 'Home & Living',
    href: '#',
    sections: [
      { title: 'Furniture', links: ['Sofas', 'Beds', 'Tables'] },
      { title: 'Home Decor', links: ['Wall Art', 'Vases', 'Clocks'] },
      { title: 'Kitchenware', links: ['Cookware', 'Dinnerware', 'Appliances'] },
      { title: 'Bedding', links: ['Bedsheets', 'Pillows', 'Comforters'] },
    ],
  },
  {
    name: 'Health & Wellness',
    href: '#',
    sections: [
      { title: 'Gym Equipment', links: ['Dumbbells', 'Treadmills'] },
      { title: 'Supplements', links: ['Protein', 'Vitamins', 'Mass Gainers'] },
      { title: 'Organic Food', links: ['Honey', 'Ghee', 'Herbal Tea'] },
      { title: 'Personal Care', links: ['Massagers', 'Monitors'] },
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
    name: 'Pet Care',
    href: '#',
    sections: [
      { title: 'Pet Food', links: ['Dog Food', 'Cat Food', 'Fish Food'] },
      { title: 'Grooming', links: ['Shampoos', 'Brushes', 'Nail Clippers'] },
      { title: 'Toys', links: ['Chew Toys', 'Balls', 'Interactive Toys'] },
      { title: 'Fashion', links: ['Collars', 'Leashes', 'Apparel'] },
    ],
  },
  {
    name: 'Sports & Outdoors',
    href: '#',
    sections: [
        { title: 'Team Sports', links: ['Cricket', 'Football', 'Basketball'] },
        { title: 'Gym & Fitness', links: ['Yoga Mats', 'Dumbbells', 'Resistance Bands'] },
        { title: 'Camping Gear', links: ['Tents', 'Sleeping Bags', 'Camping Lights'] },
    ],
  },
  {
    name: 'Smart Home & IoT',
    href: '#',
    sections: [
        { title: 'Security', links: ['Smart Cams', 'Door Locks', 'Sensors', 'Video Doorbells'] },
        { title: 'Automation', links: ['Smart Bulbs', 'Hubs & Controllers', 'Smart Plugs', 'Voice Assistants'] },
        { title: 'Kitchen', links: ['Smart Fridges', 'Automated Coffee Makers', 'Smart Ovens'] },
    ],
  },
  {
    name: 'Automotive & Biking',
    href: '#',
    sections: [
      { title: 'Bike Accessories', links: ['Helmets', 'Gloves', 'Locks'] },
      { title: 'Car Gadgets', links: ['Dash Cams', 'Chargers', 'Phone Holders'] },
      { title: 'Tires & Parts', links: ['Tires', 'Engine Oil', 'Filters'] },
    ],
  },
  {
    name: 'Books & Stationery',
    href: '#',
    sections: [
      { title: 'Books', links: ['Academic', 'Fiction', 'Non-Fiction', 'Comics'] },
      { title: 'Office Supplies', links: ['Pens', 'Notebooks', 'Staplers'] },
      { title: 'Art & Hobby', links: ['Paints', 'Brushes', 'Canvas'] },
    ],
  },
  {
    name: 'Artisan & Handicrafts',
    href: '#',
    sections: [
      { title: 'Home Decor', links: ['Pottery', 'Wall Hangings', 'Handmade Candles'] },
      { title: 'Fashion', links: ['Handwoven Sarees', 'Nakshi Kantha', 'Leather Goods'] },
      { title: 'Jewelry', links: ['Handcrafted Necklaces', 'Beaded Bracelets'] },
    ],
  },
  {
    name: 'Travel & Luggage',
    href: '#',
    sections: [
      { title: 'Bags & Luggage', links: ['Trolleys', 'Backpacks', 'Duffel Bags'] },
      { title: 'Travel Accessories', links: ['Passport Holders', 'Neck Pillows', 'Travel Adapters'] },
    ],
  },
  {
    name: 'Eco-Friendly Living',
    href: '#',
    sections: [
        { title: 'Eco Fashion', links: ['Recycled Apparel', 'Organic Cotton', 'Vegan Leather', 'Upcycled Bags'] },
        { title: 'Sustainable Home', links: ['Reusable Kitchenware', 'Solar Gadgets', 'Natural Cleaners', 'Bamboo Cutlery'] },
        { title: 'Personal Care', links: ['Zero-Waste Deodorant', 'Shampoo Bars', 'Bamboo Toothbrushes'] },
    ],
  },
  {
    name: 'Musical Instruments',
    href: '#',
    sections: [
        { title: 'Guitars', links: ['Acoustic', 'Electric', 'Bass', 'Ukuleles'] },
        { title: 'Keyboards', links: ['Digital Pianos', 'Synthesizers', 'MIDI Controllers'] },
        { title: 'Studio Gear', links: ['Microphones', 'Audio Interfaces', 'Monitors'] },
    ],
  },
  {
    name: 'Gifts & Celebrations',
    href: '#',
    sections: [
      { title: 'Gift Boxes', links: ['Corporate Gifts', 'Personalized Boxes'] },
      { title: 'Party Supplies', links: ['Balloons', 'Decorations', 'Tableware'] },
      { title: 'Flowers & Cakes', links: ['Fresh Flowers', 'Custom Cakes'] },
    ],
  },
  {
    name: 'Daily Essentials',
    href: '#',
    sections: [
      { title: 'Groceries', links: ['Rice', 'Lentils (Dal)', 'Oil', 'Spices'] },
      { title: 'Snacks', links: ['Chips', 'Biscuits', 'Nuts'] },
      { title: 'Beverages', links: ['Tea', 'Coffee', 'Juices'] },
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
      className={cn(
        'flex items-center gap-1 py-4 font-saira font-bold text-sm uppercase text-foreground hover:text-primary transition-colors whitespace-nowrap',
        category.featured && 'text-primary'
      )}
    >
      {category.name}
    </Link>
    {(category.sections || category.megaMenu) && (
      <div className="absolute left-0 top-full w-screen bg-background/80 border-t shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40 backdrop-blur-sm">
        <div className="container mx-auto p-10">
          {category.megaMenu?.type === 'grid' ? (
             <div className="grid grid-cols-5 gap-x-8 gap-y-4">
                {category.megaMenu.items.map((item) => (
                    <Link key={item.name} href={item.href} className="text-sm font-noto text-muted-foreground hover:text-foreground hover:translate-x-1 transition-transform cursor-pointer block font-medium">
                        {item.name}
                    </Link>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-4 gap-8">
              {category.sections?.map(section => (
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
          )}
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
          <div className="border-t bg-background/80 backdrop-blur-sm">
            <div className="container relative flex h-14 items-center justify-center">
              <Carousel
                opts={{
                  align: 'start',
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {categories.map((category, index) => (
                    <CarouselItem key={index} className="basis-auto pl-4">
                        <NavItem category={category} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2" />
              </Carousel>
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
                      ) : category.megaMenu?.type === 'grid' ? (
                        <ul className="space-y-2 text-muted-foreground pl-4">
                            {category.megaMenu.items.map(item => (
                                <li key={item.name} className="hover:text-foreground">
                                    <Link href={item.href}>{item.name}</Link>
                                </li>
                            ))}
                        </ul>
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
