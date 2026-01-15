
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import AverzoLogo from './averzo-logo';

// The data is hardcoded here as per the user's provided component structure.
// In a real application, this would come from a dynamic source.
const menuData: Record<string, React.ReactNode> = {
  "MEN": (
    <>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Topwear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">T-Shirts</li>
          <li className="hover:text-foreground cursor-pointer">Casual Shirts</li>
          <li className="hover:text-foreground cursor-pointer">Polos</li>
          <li className="hover:text-foreground cursor-pointer">Formal Shirts</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Bottomwear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Jeans</li>
          <li className="hover:text-foreground cursor-pointer">Chinos</li>
          <li className="hover:text-foreground cursor-pointer">Trousers</li>
        </ul>
      </div>
      <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Ethnic Wear</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Panjabi</li>
          <li className="hover:text-foreground cursor-pointer">Pajama</li>
        </ul>
      </div>
       <div className="col-span-2">
          <div className="relative h-full bg-secondary rounded-xl p-6 overflow-hidden flex flex-col justify-center border">
            <h3 className="text-2xl font-black text-primary font-saira leading-tight">Aura Men's<br/> Collection</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Explore the latest trends in men's fashion and accessories.</p>
            <button className="mt-4 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg text-xs w-max hover:bg-primary/80 transition-colors">
              SHOP NOW
            </button>
          </div>
        </div>
    </>
  ),
  "WOMEN": (
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
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Bags</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Handbags</li>
          <li className="hover:text-foreground cursor-pointer">Clutches</li>
        </ul>
      </div>
       <div className="col-span-2">
          <div className="relative h-full bg-secondary rounded-xl p-6 overflow-hidden flex flex-col justify-center border">
            <h3 className="text-2xl font-black text-primary font-saira leading-tight">Aura Women's<br/> Elegance</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Discover stylish and modern apparel for every occasion.</p>
            <button className="mt-4 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg text-xs w-max hover:bg-primary/80 transition-colors">
              SHOP NOW
            </button>
          </div>
        </div>
    </>
  ),
};

const MegaMenu = ({ isOpen, items }: { isOpen: boolean, items?: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full w-full bg-background/80 border-t shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm"
      style={{
        maxHeight: 'calc(100vh - 8rem)',
        overflowY: 'auto'
      }}
    >
      <div className="container mx-auto grid grid-cols-5 gap-8 p-10">
        {items || <p className="col-span-5 text-center text-muted-foreground">No items to display.</p>}
      </div>
    </div>
  );
};

export function StoreHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const categories = ['MEN', 'WOMEN', 'KIDS', 'ELECTRONICS', 'HEALTH & WELLNESS', 'PET CARE'];

  return (
    <header className="sticky top-0 w-full bg-background z-[110] border-b shadow-sm transition-all overflow-visible">
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

        <nav className="hidden md:flex justify-center gap-10">
          {categories.map((cat) => (
            <div
              key={cat}
              className="relative group py-3"
              onMouseEnter={() => setActiveMenu(cat)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="flex items-center gap-1 text-[13px] font-bold tracking-widest hover:text-primary transition-colors uppercase font-saira">
                {cat} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
              </button>

              <MegaMenu isOpen={activeMenu === cat} items={menuData[cat]} />
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
