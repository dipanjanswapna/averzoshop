"use client";
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';


// New structured data for categories, groups, and sub-categories
const categoriesData = [
    {
      name: "Men's Fashion",
      groups: [
        { name: "Topwear", subs: ["T-Shirts", "Casual Shirts", "Formal Shirts", "Polo Shirts", "Sweatshirts"] },
        { name: "Bottomwear", subs: ["Jeans", "Trousers", "Shorts", "Track Pants"] },
        { name: "Ethnic Wear", subs: ["Kurtas", "Sherwanis", "Jackets"] },
        { name: "Footwear", subs: ["Casual Shoes", "Formal Shoes", "Sneakers", "Sandals"] },
        { name: "Accessories", subs: ["Watches", "Belts", "Wallets", "Sunglasses"] },
      ]
    },
    {
      name: "Women's Fashion",
      groups: [
        { name: "Indian & Fusion Wear", subs: ["Sarees", "Kurtis", "Salwar Kameez", "Lehengas"] },
        { name: "Western Wear", subs: ["Dresses", "Tops", "Jeans", "Skirts"] },
        { name: "Lingerie & Sleepwear", subs: ["Bras", "Briefs", "Nightwear"] },
        { name: "Footwear", subs: ["Flats", "Heels", "Boots", "Sneakers"] },
        { name: "Accessories", subs: ["Handbags", "Jewellery", "Sunglasses"] },
      ]
    },
    { name: "Electronics & Gadgets", groups: [ { name: "Mobiles & Laptops", subs: ["Laptops", "Mobiles", "Tablets"] }, { name: "Cameras & Drones", subs: ["DSLR", "Drones", "GoPro"] } ] },
    { name: "Kids & Baby", groups: [ { name: "Clothing", subs: ["Boys", "Girls", "Infants"] }, { name: "Toys", subs: ["Action", "Educational"] } ]  },
    { name: "Beauty & Personal Care", groups: [ { name: "Skincare", subs: ["Face Wash", "Moisturizer"] }, { name: "Makeup", subs: ["Lipstick", "Foundation"] } ]  },
    { name: "Home & Living", groups: [ { name: "Decor", subs: ["Wall Art", "Lamps"] }, { name: "Kitchen", subs: ["Cookware", "Appliances"] } ]  },
    { name: "Health & Wellness", groups: [ { name: "Supplements", subs: ["Vitamins", "Protein"] }, { name: "Gym Gear", subs: ["Weights", "Mats"] } ]  },
    { name: "Gaming & Esports", groups: [ { name: "Hardware", subs: ["Gaming PCs", "Consoles", "Chairs"] }, { name: "Accessories", subs: ["Headsets", "Keyboards"] } ]  },
    { name: "Pet Care", groups: [ { name: "Food", subs: ["Dog Food", "Cat Food"] }, { name: "Grooming", subs: ["Shampoos", "Brushes"] } ]  },
    { name: "Sports & Outdoors", groups: [ { name: "Cricket", subs: ["Bats", "Balls"] }, { name: "Camping", subs: ["Tents", "Backpacks"] } ]  },
    { name: "Smart Home & IoT", groups: [ { name: "Lighting", subs: ["Smart Bulbs", "LED Strips"] }, { name: "Security", subs: ["Cameras", "Sensors"] } ]  },
    { name: "Automotive & Biking", groups: [ { name: "Helmets", subs: ["Full-face", "Open-face"] }, { name: "Accessories", subs: ["Gloves", "Jackets"] } ]  },
    { name: "Books & Stationery", groups: [ { name: "Books", subs: ["Fiction", "Academic"] }, { name: "Stationery", subs: ["Pens", "Notebooks"] } ]  },
    { name: "Artisan & Handicrafts", groups: [ { name: "Decor", subs: ["Paintings", "Sculptures"] }, { name: "Crafts", subs: ["Pottery", "Woodwork"] } ]  },
    { name: "Travel & Luggage", groups: [ { name: "Bags", subs: ["Trolleys", "Backpacks"] }, { name: "Accessories", subs: ["Neck Pillows", "Locks"] } ]  },
    { name: "Eco-Friendly Living", groups: [ { name: "Fashion", subs: ["Sustainable", "Recycled"] }, { name: "Home", subs: ["Solar", "Compost"] } ]  },
    { name: "Musical Instruments", groups: [ { name: "String", subs: ["Guitars", "Keyboards"] }, { name: "Percussion", subs: ["Drums", "Cajons"] } ]  },
    { name: "Gifts & Celebrations", groups: [ { name: "Gifts", subs: ["Gift Boxes", "Cards"] }, { name: "Party", subs: ["Balloons", "Decorations"] } ]  },
    { name: "Daily Essentials (Groceries)", groups: [ { name: "Staples", subs: ["Rice", "Flour"] }, { name: "Snacks", subs: ["Chips", "Biscuits"] } ]  },
];


const MobileSidebar = ({ isOpen, onClose, categories }: { isOpen: boolean, onClose: () => void, categories: typeof categoriesData }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      {/* Main Slide Panel */}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-[160] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b bg-zinc-900 text-white">
          <span className="text-xl font-black font-saira uppercase">AVERZO.</span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="h-[calc(100vh-70px)] overflow-y-auto pb-10 custom-scrollbar">
          
          {/* Profile Quick Link */}
          <div className="p-5 border-b flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">U</div>
             <div>
               <p className="text-xs font-bold text-zinc-800">Welcome, User</p>
               <p className="text-[10px] text-zinc-500">Login to your account</p>
             </div>
          </div>

          {/* Accordion Menu */}
          <div className="py-2">
            <p className="px-5 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Categories</p>
            {categories.map((cat, index) => (
              <div key={index} className="border-b border-zinc-50">
                <button 
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between py-4 px-5 text-sm font-bold text-zinc-700 hover:text-primary transition-colors"
                >
                  {cat.name}
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
                </button>

                {/* Sub-category slide */}
                <div className={`overflow-hidden transition-all duration-300 bg-zinc-50 ${openIndex === index ? "max-h-96" : "max-h-0"}`}>
                    <div className="py-2 px-8 space-y-3">
                        {cat.groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="pt-2">
                                <p className="font-bold text-xs text-zinc-800 uppercase">{group.name}</p>
                                <ul className="pt-2 space-y-2">
                                {group.subs.map((sub, i) => (
                                    <li key={i} className="text-xs font-semibold text-zinc-500 hover:text-primary cursor-pointer">
                                        {sub}
                                    </li>
                                ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};


export default function AverzoNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 100) { 
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-background shadow-sm transition-all duration-300">
      
      {/* 1. Primary Master Header (Always Sticky) */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 lg:hidden hover:bg-muted rounded-md transition-colors"
            >
                <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl font-black font-saira tracking-tighter text-foreground">
                AVERZO<span className="text-primary">.</span>
            </Link>
        </div>

        {/* Main Search Bar */}
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

        {/* User Action Icons */}
        <div className="flex items-center gap-5">
          <User size={22} className="cursor-pointer hover:text-primary transition-colors" />
          <div className="relative cursor-pointer">
            <ShoppingBag size={22} className="hover:text-primary transition-colors" />
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Category Bar (Auto-hides) */}
      <nav className={cn(
          "bg-secondary text-secondary-foreground transition-all duration-300 origin-top",
          "hidden lg:flex",
          isVisible ? "scale-y-100 opacity-100 h-10" : "scale-y-0 opacity-0 h-0"
      )}>
        <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className="container mx-auto px-4 flex items-center gap-8 h-full">
            {categoriesData.map((item) => (
                <div key={item.name} className="group static">
                <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary">
                    {item.name} <ChevronDown size={12} />
                </button>
                
                {/* 3. Full-width Mega Menu */}
                <div 
                    className="absolute left-0 right-0 top-full w-full bg-background text-foreground border-t shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110]"
                    style={{ 
                    maxHeight: 'calc(100vh - 112px)', 
                    overflowY: 'auto' 
                    }}
                >
                    <div className="container mx-auto grid grid-cols-5 gap-x-10 gap-y-6 p-10">
                        {item.groups.map(group => (
                            <div key={group.name} className="col-span-1">
                                <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">{group.name}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground font-body">
                                {group.subs.map(sub => (
                                    <li key={sub} className="hover:text-primary cursor-pointer">{sub}</li>
                                ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
      </nav>

       <MobileSidebar 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          categories={categoriesData}
        />
    </header>
  );
}
