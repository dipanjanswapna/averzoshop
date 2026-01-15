"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import AverzoLogo from './averzo-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from './ui/button';

const menuData: Record<string, React.ReactNode> = {
  "All Categories": (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6">
      {[
        "Men's Fashion", "Women's Fashion", "Electronics & Gadgets", "Kids & Baby", 
        "Beauty & Personal Care", "Home & Living", "Health & Wellness", "Gaming & Esports", 
        "Pet Care", "Sports & Outdoors", "Smart Home & IoT", "Automotive & Biking", 
        "Books & Stationery", "Artisan & Handicrafts", "Travel & Luggage", 
        "Eco-Friendly Living", "Musical Instruments", "Gifts & Celebrations", 
        "Daily Essentials (Groceries)"
      ].map((category) => (
        <Link key={category} href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          {category}
        </Link>
      ))}
    </div>
  ),
  "Men's Fashion": (
    <>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Topwear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">T-Shirts</li>
          <li className="hover:text-foreground cursor-pointer">Casual Shirts</li>
          <li className="hover:text-foreground cursor-pointer">Polos</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Bottomwear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Jeans</li>
          <li className="hover:text-foreground cursor-pointer">Chinos</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Ethnic Wear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Panjabi</li>
          <li className="hover:text-foreground cursor-pointer">Pajama</li>
        </ul>
      </div>
       <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Accessories</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Wallets</li>
          <li className="hover:text-foreground cursor-pointer">Belts</li>
          <li className="hover:text-foreground cursor-pointer">Watches</li>
        </ul>
      </div>
    </>
  ),
    "Women's Fashion": (
     <>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Saree</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Cotton</li>
          <li className="hover:text-foreground cursor-pointer">Silk</li>
          <li className="hover:text-foreground cursor-pointer">Jamdani</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Salwar Kameez</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Stitched</li>
          <li className="hover:text-foreground cursor-pointer">Unstitched</li>
        </ul>
      </div>
       <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Western Wear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Tops</li>
          <li className="hover:text-foreground cursor-pointer">Jeans</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Bags & Accessories</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Handbags</li>
          <li className="hover:text-foreground cursor-pointer">Clutches</li>
           <li className="hover:text-foreground cursor-pointer">Jewellery</li>
        </ul>
      </div>
    </>
  ),
  "Electronics & Gadgets": (
    <>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Computers</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Laptops</li>
          <li className="hover:text-foreground cursor-pointer">Desktops</li>
          <li className="hover:text-foreground cursor-pointer">Monitors</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Mobiles</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Smartphones</li>
          <li className="hover:text-foreground cursor-pointer">Tablets</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Cameras</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">DSLR</li>
          <li className="hover:text-foreground cursor-pointer">Action Cameras</li>
        </ul>
      </div>
    </>
  ),
  "Kids & Baby": (
    <>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Boys' Clothing</h4>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Girls' Clothing</h4>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Toys</h4>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Baby Care</h4>
      </div>
    </>
  )
};


const MegaMenu = ({ isOpen, items }: { isOpen: boolean, items?: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full w-full bg-background/80 border-t shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm"
      style={{
        maxHeight: '70vh',
        overflowY: 'auto'
      }}
    >
      <div className="container mx-auto grid grid-cols-4 gap-8 p-10">
        {items || <p className="col-span-5 text-center text-muted-foreground">No items to display.</p>}
      </div>
    </div>
  );
};

export function StoreHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const allCategories = [
    "All Categories", "Men's Fashion", "Women's Fashion", "Electronics & Gadgets", "Kids & Baby", 
    "Beauty & Personal Care", "Home & Living", "Health & Wellness", "Gaming & Esports", 
    "Pet Care", "Sports & Outdoors", "Smart Home & IoT", "Automotive & Biking", 
    "Books & Stationery", "Artisan & Handicrafts", "Travel & Luggage", 
    "Eco-Friendly Living", "Musical Instruments", "Gifts & Celebrations", 
    "Daily Essentials (Groceries)"
  ];
  
  const mainCategories = allCategories.slice(0, 10);
  const moreCategories = allCategories.slice(10);

  return (
    <header className="sticky top-0 w-full bg-background z-50 border-b shadow-sm transition-all overflow-visible">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-6">
          <Link href="/" className="text-3xl font-black font-saira tracking-tighter text-foreground">
             <AverzoLogo className="h-8 w-auto" />
          </Link>

          <div className="flex-1 max-w-2xl relative hidden md:block">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className="w-full bg-secondary border-none rounded-lg py-2.5 px-6 focus:ring-2 focus:ring-primary outline-none text-sm font-body"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-bold text-sm text-foreground">
             <div className="flex-col items-center cursor-pointer hover:text-primary hidden sm:flex">
              <Search size={20} strokeWidth={2.5} className="md:hidden"/>
              <span className="text-[10px] uppercase mt-1 md:hidden">Search</span>
            </div>
            <Link href="/login" className="flex flex-col items-center cursor-pointer hover:text-primary">
              <User size={20} strokeWidth={2.5} />
              <span className="text-[10px] uppercase mt-1">Profile</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center cursor-pointer hover:text-primary relative">
              <ShoppingCart size={20} strokeWidth={2.5} />
              <span className="text-[10px] uppercase mt-1">Bag</span>
              <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex justify-center items-center gap-6">
          {mainCategories.map((cat) => (
              <div
                key={cat}
                className="relative group py-3"
                onMouseEnter={() => setActiveMenu(cat)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 text-[12px] font-bold tracking-wider hover:text-primary transition-colors uppercase font-saira">
                  {cat}
                </button>
                <MegaMenu isOpen={activeMenu === cat} items={menuData[cat]} />
              </div>
            ))}
             {moreCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-[12px] font-bold tracking-wider hover:text-primary transition-colors uppercase font-saira py-3">
                    More <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {moreCategories.map((cat) => (
                    <DropdownMenuItem key={cat}>
                        {/* You can add link here if needed */}
                        <span>{cat}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </nav>
      </div>
    </header>
  );
}
