"use client";
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, ChevronDown, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


// New structured data for categories, groups, and sub-categories
const categoriesData = [
    {
      mother_name: "Men's Fashion",
      groups: [
        { group_name: "Topwear", subs: ["T-Shirts", "Casual Shirts", "Formal Shirts", "Polo Shirts", "Sweatshirts"] },
        { group_name: "Bottomwear", subs: ["Jeans", "Trousers", "Shorts", "Track Pants"] },
        { group_name: "Ethnic Wear", subs: ["Kurtas", "Sherwanis", "Jackets"] },
        { group_name: "Footwear", subs: ["Casual Shoes", "Formal Shoes", "Sneakers", "Sandals"] },
        { group_name: "Accessories", subs: ["Watches", "Belts", "Wallets", "Sunglasses"] },
      ]
    },
    {
      mother_name: "Women's Fashion",
      groups: [
        { group_name: "Indian & Fusion Wear", subs: ["Sarees", "Kurtis", "Salwar Kameez", "Lehengas"] },
        { group_name: "Western Wear", subs: ["Dresses", "Tops", "Jeans", "Skirts"] },
        { group_name: "Lingerie & Sleepwear", subs: ["Bras", "Briefs", "Nightwear"] },
        { group_name: "Footwear", subs: ["Flats", "Heels", "Boots", "Sneakers"] },
        { group_name: "Accessories", subs: ["Handbags", "Jewellery", "Sunglasses"] },
      ]
    },
    { mother_name: "Electronics & Gadgets", groups: [ { group_name: "Mobiles & Laptops", subs: ["Laptops", "Mobiles", "Tablets"] }, { group_name: "Cameras & Drones", subs: ["DSLR", "Drones", "GoPro"] } ] },
    { mother_name: "Kids & Baby", groups: [ { group_name: "Clothing", subs: ["Boys", "Girls", "Infants"] }, { group_name: "Toys", subs: ["Action", "Educational"] } ]  },
    { mother_name: "Beauty & Personal Care", groups: [ { group_name: "Skincare", subs: ["Face Wash", "Moisturizer"] }, { group_name: "Makeup", subs: ["Lipstick", "Foundation"] } ]  },
    { mother_name: "Home & Living", groups: [ { group_name: "Decor", subs: ["Wall Art", "Lamps"] }, { group_name: "Kitchen", subs: ["Cookware", "Appliances"] } ]  },
    { mother_name: "Health & Wellness", groups: [ { group_name: "Supplements", subs: ["Vitamins", "Protein"] }, { group_name: "Gym Gear", subs: ["Weights", "Mats"] } ]  },
    { mother_name: "Gaming & Esports", groups: [ { group_name: "Hardware", subs: ["Gaming PCs", "Consoles", "Chairs"] }, { group_name: "Accessories", subs: ["Headsets", "Keyboards"] } ]  },
    { mother_name: "Pet Care", groups: [ { group_name: "Food", subs: ["Dog Food", "Cat Food"] }, { group_name: "Grooming", subs: ["Shampoos", "Brushes"] } ]  },
    { mother_name: "Sports & Outdoors", groups: [ { group_name: "Cricket", subs: ["Bats", "Balls"] }, { group_name: "Camping", subs: ["Tents", "Backpacks"] } ]  },
    { mother_name: "Smart Home & IoT", groups: [ { group_name: "Lighting", subs: ["Smart Bulbs", "LED Strips"] }, { group_name: "Security", subs: ["Cameras", "Sensors"] } ]  },
    { mother_name: "Automotive & Biking", groups: [ { group_name: "Helmets", subs: ["Full-face", "Open-face"] }, { group_name: "Accessories", subs: ["Gloves", "Jackets"] } ]  },
    { mother_name: "Books & Stationery", groups: [ { group_name: "Books", subs: ["Fiction", "Academic"] }, { group_name: "Stationery", subs: ["Pens", "Notebooks"] } ]  },
    { mother_name: "Artisan & Handicrafts", groups: [ { group_name: "Decor", subs: ["Paintings", "Sculptures"] }, { group_name: "Crafts", subs: ["Pottery", "Woodwork"] } ]  },
    { mother_name: "Travel & Luggage", groups: [ { group_name: "Bags", subs: ["Trolleys", "Backpacks"] }, { group_name: "Accessories", subs: ["Neck Pillows", "Locks"] } ]  },
    { mother_name: "Eco-Friendly Living", groups: [ { group_name: "Fashion", subs: ["Sustainable", "Recycled"] }, { group_name: "Home", subs: ["Solar", "Compost"] } ]  },
    { mother_name: "Musical Instruments", groups: [ { group_name: "String", subs: ["Guitars", "Keyboards"] }, { group_name: "Percussion", subs: ["Drums", "Cajons"] } ]  },
    { mother_name: "Gifts & Celebrations", groups: [ { group_name: "Gifts", subs: ["Gift Boxes", "Cards"] }, { group_name: "Party", subs: ["Balloons", "Decorations"] } ]  },
    { mother_name: "Daily Essentials (Groceries)", groups: [ { group_name: "Staples", subs: ["Rice", "Flour"] }, { group_name: "Snacks", subs: ["Chips", "Biscuits"] } ]  },
];


const NestedAccordion = ({ category, onClose }: { category: any, onClose: () => void }) => {
  const [isMotherOpen, setIsMotherOpen] = useState(false);
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null);

  // Group accordion toggle korar logic
  const toggleGroup = (index: number) => {
    setOpenGroupIndex(openGroupIndex === index ? null : index);
  };

  return (
    <div className="border-b border-gray-100">
      {/* ১. Mother Category (e.g., Men's Fashion) */}
      <button 
        onClick={() => setIsMotherOpen(!isMotherOpen)}
        className="w-full flex items-center justify-between py-4 px-5 text-sm font-bold text-zinc-800 hover:bg-gray-50"
      >
        <span className="uppercase tracking-wide">{category.mother_name}</span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isMotherOpen ? "rotate-180 text-primary" : ""}`} />
      </button>

      {/* ২. Group Level (e.g., TOPWEAR, BOTTOMWEAR) */}
      <div className={`overflow-hidden transition-all duration-300 ${isMotherOpen ? "max-h-[1000px] bg-zinc-50" : "max-h-0"}`}>
        {category.groups.map((group: any, idx: number) => (
          <div key={idx} className="border-t border-white">
            <button 
              onClick={() => toggleGroup(idx)}
              className="w-full flex items-center justify-between py-3 px-8 text-[11px] font-black text-zinc-500 uppercase tracking-widest"
            >
              {group.group_name}
              <ChevronRight size={14} className={`transition-transform ${openGroupIndex === idx ? "rotate-90 text-primary" : ""}`} />
            </button>

            {/* ৩. Sub-category Level (e.g., T-Shirts, Casual Shirts) */}
            <ul className={`overflow-hidden transition-all duration-300 ${openGroupIndex === idx ? "max-h-96 pb-3" : "max-h-0"}`}>
              {group.subs.map((sub: string, sIdx: number) => (
                <li 
                  key={sIdx} 
                  onClick={onClose}
                  className="pl-12 pr-5 py-2 text-xs font-semibold text-gray-600 hover:text-primary cursor-pointer active:bg-primary/10"
                >
                  <Link href="/shop">{sub}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};


const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
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
        <div className="flex items-center justify-between p-5 border-b bg-foreground text-background">
          <span className="text-xl font-black font-saira uppercase">Averzo.</span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="h-[calc(100vh-70px)] overflow-y-auto pb-10">
          
          {/* Profile Quick Link */}
          <div className="p-5 border-b flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">U</div>
             <div>
               <p className="text-xs font-bold text-foreground">Welcome, User</p>
               <p className="text-[10px] text-muted-foreground">Login to your account</p>
             </div>
          </div>

          {/* Accordion Menu */}
          <div className="py-2">
            <p className="px-5 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">All Categories</p>
            {categoriesData.map((cat, index) => (
              <NestedAccordion key={index} category={cat} onClose={onClose} />
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
        <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 lg:hidden hover:bg-muted rounded-md transition-colors"
            >
                <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl font-black font-saira tracking-tighter text-foreground">
                AVERZO<span className="text-primary">.</span>
            </Link>
            <div className="hidden lg:block">
                <Link href="/shop">
                    <Button variant="ghost" className="font-bold">Shop</Button>
                </Link>
            </div>
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
          <Link href="/login">
            <User size={22} className="cursor-pointer hover:text-primary transition-colors" />
          </Link>
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
                <div key={item.mother_name} className="group static">
                <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary">
                    {item.mother_name} <ChevronDown size={12} />
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
                            <div key={group.group_name} className="col-span-1">
                                <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">{group.group_name}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground font-body">
                                {group.subs.map(sub => (
                                    <li key={sub} className="hover:text-primary cursor-pointer"><Link href="/shop">{sub}</Link></li>
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
        />
    </header>
  );
}
