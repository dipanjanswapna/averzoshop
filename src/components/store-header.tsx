"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, User, Menu, ChevronDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const allCategories = [
    { name: "All Categories" },
    { name: "Men's Fashion" },
    { name: "Women's Fashion" },
    { name: "Electronics & Gadgets" },
    { name: "Kids & Baby" },
    { name: "Beauty & Personal Care" },
    { name: "Home & Living" },
    { name: "Health & Wellness" },
    { name: "Gaming & Esports" },
    { name: "Pet Care" },
    { name: "Sports & Outdoors" },
    { name: "Smart Home & IoT" },
    { name: "Automotive & Biking" },
    { name: "Books & Stationery" },
    { name: "Artisan & Handicrafts" },
    { name: "Travel & Luggage" },
    { name: "Eco-Friendly Living" },
    { name: "Musical Instruments" },
    { name: "Gifts & Celebrations" },
    { name: "Daily Essentials (Groceries)" },
  ];
  
const MegaMenuContent = ({ categoryName }: { categoryName: string }) => {
    // In a real app, this data would come from a CMS or API based on the categoryName
    const groups = {
      "Men's Fashion": ['Topwear', 'Bottomwear', 'Ethnic Wear', 'Footwear', 'Accessories'],
      "Women's Fashion": ['Saree', 'Salwar Kameez', 'Western Wear', 'Bags & Accessories', 'Jewellery'],
      "Electronics & Gadgets": ['Laptops', 'Mobiles', 'Cameras', 'Smart Devices', 'Audio'],
      "Default": ['Sub-Category 1', 'Sub-Category 2', 'Sub-Category 3', 'Sub-Category 4', 'Sub-Category 5']
    };
  
    const subcategories = groups[categoryName as keyof typeof groups] || groups.Default;
  
    return (
      <div className="absolute left-0 right-0 top-full w-full bg-background text-foreground border-t shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110]">
        <div className="container mx-auto grid grid-cols-5 gap-10 p-10 max-h-[70vh] overflow-y-auto">
          {/* Example Columns */}
          <div className="col-span-1">
            <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">{subcategories[0]}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li className="hover:text-primary cursor-pointer">Casual Shirts</li>
              <li className="hover:text-primary cursor-pointer">Formal Shirts</li>
              <li className="hover:text-primary cursor-pointer">T-Shirts</li>
              <li className="hover:text-primary cursor-pointer">Polos</li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">{subcategories[1]}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li className="hover:text-primary cursor-pointer">Jeans</li>
              <li className="hover:text-primary cursor-pointer">Trousers</li>
              <li className="hover:text-primary cursor-pointer">Shorts</li>
            </ul>
          </div>
           {/* ব্র্যান্ড জোন - Aura Highlight */}
           <div className="col-span-2 flex flex-col items-center border-l border-r px-10">
             <h4 className="font-bold mb-6 text-xs uppercase">Featured Brands</h4>
             <div className="flex gap-6">
                {['Aura Men', 'Aura Women'].map(brand => (
                  <div key={brand} className="text-center group/brand cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-muted border-2 border-transparent group-hover/brand:border-primary overflow-hidden transition-all">
                       <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">IMG</div>
                    </div>
                    <span className="text-[10px] font-bold mt-2 block uppercase">{brand}</span>
                  </div>
                ))}
             </div>
          </div>
           <div className="col-span-1">
            <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">{subcategories[2]}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li className="hover:text-primary cursor-pointer">Kurtas</li>
              <li className="hover:text-primary cursor-pointer">Sherwanis</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
export default function StoreHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // স্ক্রল লজিক: নিচের দিকে স্ক্রল করলে সেকেন্ডারি বার হাইড হবে
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 100) { 
        setIsVisible(false); // স্ক্রল ১০০ পিক্সেল পার হলে হাইড হবে
      } else {
        setIsVisible(true); // উপরে থাকলে শো করবে
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-background shadow-sm transition-all duration-300">
      
      {/* ১. প্রাইমারি মাস্টার হেডার (সবসময় Sticky থাকবে) */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        <div className="text-2xl font-black font-saira tracking-tighter text-foreground">
          AVERZO<span className="text-primary">.</span>
        </div>

        {/* মেইন সার্চ বার */}
        <div className="flex-1 max-w-2xl relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search for products, brands and more..." 
            className="w-full bg-muted border-none rounded-md py-2 px-5 outline-none focus:ring-2 focus:ring-primary text-sm font-body"
          />
          <button className="absolute right-0 top-0 h-full bg-primary text-primary-foreground px-4 rounded-r-md">
            <Search size={18} />
          </button>
        </div>

        {/* ইউজার অ্যাকশন আইকন */}
        <div className="flex items-center gap-5">
          <User size={22} className="cursor-pointer hover:text-primary transition-colors" />
          <div className="relative cursor-pointer">
            <ShoppingBag size={22} />
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </div>
        </div>
      </div>

      {/* ২. সেকেন্ডারি ক্যাটাগরি বার (এটি হাইড হবে) */}
      <nav className={`bg-secondary text-secondary-foreground transition-all duration-300 origin-top ${isVisible ? "scale-y-100 opacity-100 h-10" : "scale-y-0 opacity-0 h-0"}`}>
        <div className="container mx-auto px-4 flex items-center justify-center gap-8 h-full overflow-x-auto whitespace-nowrap">
          {["Men's Fashion", "Women's Fashion", "Kids & Baby", "Electronics & Gadgets", "Grooming", "Home & Living"].map((item) => (
            <div key={item} className="group static">
              <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary">
                {item} <ChevronDown size={12} />
              </button>
              
              <MegaMenuContent categoryName={item} />
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
}