
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import AverzoLogo from './averzo-logo';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const menuData: Record<string, React.ReactNode> = {
  "All Categories": (
    <div className="grid grid-cols-5 gap-x-8 gap-y-6">
      {[
        "Men's Fashion", "Women's Fashion", "Electronics & Gadgets", "Kids & Baby", 
        "Beauty & Personal Care", "Home & Living", "Health & Wellness", "Gaming & Esports", 
        "Pet Essentials", "Sports & Outdoors", "Smart Home & IoT", "Automotive & Biking", 
        "Books & Stationery", "Artisan & Handicrafts", "Travel & Luggage", 
        "Eco-Friendly Living", "Musical Instruments", "Gifts & Celebrations", 
        "Daily Essentials (Groceries)", "Industrial & Tools"
      ].map((category) => (
        <Link key={category} href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          {category}
        </Link>
      ))}
    </div>
  ),
  "Men's Fashion": (
    <div className='grid grid-cols-4 gap-x-8'>
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
    </div>
  ),
  "Women's Fashion": (
     <div className='grid grid-cols-4 gap-x-8'>
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
    </div>
  ),
  "Electronics & Gadgets": (
    <div className='grid grid-cols-4 gap-x-8'>
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
       <div className="col-span-1">
        <h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Smart Dice</h4>
        <ul className="space-y-2 text-sm text-muted-foreground font-body">
          <li className="hover:text-foreground cursor-pointer">Ryans Style</li>
        </ul>
      </div>
    </div>
  ),
    "Eco & Sustainable Living": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Eco Fashion</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Recycled Fabrics</li><li className="hover:text-foreground cursor-pointer">Organic Cotton</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Green Gadgets</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Solar Chargers</li><li className="hover:text-foreground cursor-pointer">Energy-Saving Devices</li></ul></div>
    </div>
  ),
  "Smart Home & IoT": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Security</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Smart Cams</li><li className="hover:text-foreground cursor-pointer">Door Locks</li><li className="hover:text-foreground cursor-pointer">Sensors</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Automation</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Smart Bulbs</li><li className="hover:text-foreground cursor-pointer">Hubs</li><li className="hover:text-foreground cursor-pointer">Plugs</li></ul></div>
    </div>
  ),
  "Gaming & Esports": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">PC Gaming</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Graphic Cards</li><li className="hover:text-foreground cursor-pointer">Monitors</li><li className="hover:text-foreground cursor-pointer">RAM</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Peripherals</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Keyboards</li><li className="hover:text-foreground cursor-pointer">Mouse</li><li className="hover:text-foreground cursor-pointer">Headsets</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Consoles</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">PlayStation</li><li className="hover:text-foreground cursor-pointer">Xbox</li><li className="hover:text-foreground cursor-pointer">Nintendo</li></ul></div>
    </div>
  ),
  "Aura Grooming": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Skincare</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Cleansers</li><li className="hover:text-foreground cursor-pointer">Serums</li><li className="hover:text-foreground cursor-pointer">Moisturizers</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Electronics</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Trimmers</li><li className="hover:text-foreground cursor-pointer">Hair Dryers</li></ul></div>
    </div>
  ),
  "Artisan & Handicrafts": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Decor</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Pottery</li><li className="hover:text-foreground cursor-pointer">Handmade Paintings</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Textiles</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Nakshi Kantha</li><li className="hover:text-foreground cursor-pointer">Handwoven Scarves</li></ul></div>
    </div>
  ),
  "Baby & Toddler": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Essentials</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Diapers</li><li className="hover:text-foreground cursor-pointer">Baby Food</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Gear</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Strollers</li><li className="hover:text-foreground cursor-pointer">Car Seats</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Nursery</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Cribs</li><li className="hover:text-foreground cursor-pointer">Monitors</li></ul></div>
    </div>
  ),
  "Musical Instruments": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">String</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Guitars</li><li className="hover:text-foreground cursor-pointer">Violins</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Keys</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Keyboards</li><li className="hover:text-foreground cursor-pointer">Pianos</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Studio</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Microphones</li><li className="hover:text-foreground cursor-pointer">Sound Systems</li></ul></div>
    </div>
  ),
  "Safety & Security": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Personal Safety</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Pepper Spray</li><li className="hover:text-foreground cursor-pointer">Safety Alarms</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Industrial</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Hard Hats</li><li className="hover:text-foreground cursor-pointer">Safety Goggles</li></ul></div>
    </div>
  ),
  "Travel & Luggage": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Bags</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Suitcases</li><li className="hover:text-foreground cursor-pointer">Backpacks</li><li className="hover:text-foreground cursor-pointer">Duffels</li></ul></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Accessories</h4><ul className="space-y-2 text-sm text-muted-foreground font-body"><li className="hover:text-foreground cursor-pointer">Neck Pillows</li><li className="hover:text-foreground cursor-pointer">Adapters</li><li className="hover:text-foreground cursor-pointer">Organizers</li></ul></div>
    </div>
  ),
  "Kids & Baby": (
    <div className='grid grid-cols-4 gap-x-8'>
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
    </div>
  ),
  "Beauty & Personal Care": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Skincare</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Makeup</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Hair Care</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Fragrance</h4></div>
    </div>
  ),
  "Home & Living": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Furniture</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Home Decor</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Kitchen & Dining</h4></div>
    </div>
  ),
  "Health & Wellness": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Organic Food</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Gym Supplements</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Personal Care Devices</h4></div>
    </div>
  ),
  "Pet Essentials": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Pet Food</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Grooming Kits</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Toys & Accessories</h4></div>
    </div>
  ),
  "Sports & Outdoors": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Team Sports</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Outdoor Gear</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Fitness Equipment</h4></div>
    </div>
  ),
  "Automotive & Biking": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Bike Accessories</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Helmets & Gear</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Car Gadgets</h4></div>
    </div>
  ),
  "Books & Stationery": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Office Supplies</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Hobby & Crafts</h4></div>
    </div>
  ),
  "Gifts & Flowers": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Gift Boxes</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Personalized Items</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Flower Bouquets</h4></div>
    </div>
  ),
  "Daily Essentials (Groceries)": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Staples</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Snacks & Beverages</h4></div>
    </div>
  ),
  "Industrial & Tools": (
    <div className='grid grid-cols-4 gap-x-8'>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Hardware Tools</h4></div>
      <div className="col-span-1"><h4 className="font-bold text-primary mb-4 font-saira uppercase tracking-wider">Safety Gear</h4></div>
    </div>
  ),
};

const MegaMenu = ({ isOpen, items }: { isOpen: boolean, items?: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full w-full bg-background/80 border-t shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm"
      style={{
        maxHeight: '70vh',
        overflowY: 'auto',
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

  const allCategories = Object.keys(menuData);
  const visibleCategories = allCategories.slice(0, 10);
  const hiddenCategories = allCategories.slice(10);

  return (
    <header className="sticky top-0 w-full bg-background z-50 shadow-sm">
       {/* Layer 1: Top Bar */}
        <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between py-3 gap-6 border-b">
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
        </div>
      
      {/* Layer 2: Category Bar */}
      <nav className="w-full bg-background border-b">
        <div className="container mx-auto px-4 lg:px-8 flex items-center gap-6">
            {visibleCategories.map((cat) => (
                <div
                    key={cat}
                    className="relative group py-3"
                    onMouseEnter={() => setActiveMenu(cat)}
                    onMouseLeave={() => setActiveMenu(null)}
                >
                    <button className="flex items-center gap-1 text-[12px] font-bold tracking-wider hover:text-primary transition-colors uppercase font-saira whitespace-nowrap">
                    {cat}
                    </button>
                    <MegaMenu isOpen={activeMenu === cat} items={menuData[cat]} />
                </div>
            ))}
             {hiddenCategories.length > 0 && (
                <div className="relative group py-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 text-[12px] font-bold tracking-wider hover:text-primary transition-colors uppercase font-saira whitespace-nowrap">
                                More <ChevronDown size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {hiddenCategories.map((cat) => (
                                 <DropdownMenuItem key={cat} asChild>
                                    <div
                                        className="relative group py-3 px-2"
                                        onMouseEnter={() => setActiveMenu(cat)}
                                        onMouseLeave={() => setActiveMenu(null)}
                                    >
                                        <button className="flex items-center justify-between w-full text-[12px] font-bold tracking-wider hover:text-primary transition-colors uppercase font-saira whitespace-nowrap">
                                            {cat}
                                        </button>
                                        <MegaMenu isOpen={activeMenu === cat} items={menuData[cat]} />
                                    </div>
                                 </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
      </nav>
    </header>
  );
}
