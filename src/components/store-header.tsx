
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, User, Menu, ChevronDown, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { categoriesData } from '@/lib/categories';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useCart } from '@/hooks/use-cart';


const NestedAccordion = ({ category, onClose }: { category: any, onClose: () => void }) => {
  const [isMotherOpen, setIsMotherOpen] = useState(false);
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null);

  const toggleGroup = (index: number) => {
    setOpenGroupIndex(openGroupIndex === index ? null : index);
  };

  const createQueryString = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    return searchParams.toString();
  };

  const motherCategoryPath = category.path || `/shop?${createQueryString({ mother_category: category.mother_name })}`;


  return (
    <div className="border-b border-gray-100">
      <button 
        onClick={() => setIsMotherOpen(!isMotherOpen)}
        className="w-full flex items-center justify-between py-4 px-5 text-sm font-bold text-zinc-800 hover:bg-gray-50"
      >
        <Link href={motherCategoryPath} onClick={onClose} className="uppercase tracking-wide truncate">{category.mother_name}</Link>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isMotherOpen ? "rotate-180 text-primary" : ""}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isMotherOpen ? "max-h-[1000px] bg-zinc-50" : "max-h-0"}`}>
        {category.groups.map((group: any, idx: number) => (
          <div key={idx} className="border-t border-white">
            <button 
              onClick={() => toggleGroup(idx)}
              className="w-full flex items-center justify-between py-3 px-8 text-[11px] font-black text-zinc-500 uppercase tracking-widest"
            >
              <Link href={`/shop?${createQueryString({ mother_category: category.mother_name, group: group.group_name })}`} onClick={onClose} className="truncate">{group.group_name}</Link>
              <ChevronRight size={14} className={`transition-transform ${openGroupIndex === idx ? "rotate-90 text-primary" : ""}`} />
            </button>
            <ul className={`overflow-hidden transition-all duration-300 ${openGroupIndex === idx ? "max-h-96 pb-3" : "max-h-0"}`}>
              {group.subs.map((sub: string, sIdx: number) => (
                <li 
                  key={sIdx} 
                  onClick={onClose}
                  className="pl-12 pr-5 py-2 text-xs font-semibold text-gray-600 hover:text-primary cursor-pointer active:bg-primary/10"
                >
                  <Link href={`/shop?${createQueryString({ mother_category: category.mother_name, group: group.group_name, subcategory: sub })}`} className="truncate block">{sub}</Link>
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const createQueryString = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    return searchParams.toString();
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20, display: 'none' },
    visible: { opacity: 1, y: 0, display: 'block', transition: { staggerChildren: 0.05 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-background shadow-sm transition-all duration-300">
      
      {/* 1. Primary Master Header (Always Sticky) */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8 h-[68px]">
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
          <Link href="/cart" className="relative cursor-pointer">
            <ShoppingBag size={22} className="hover:text-primary transition-colors" />
            {isMounted && items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 2. Secondary Category Bar (Auto-hides) */}
      <nav 
        className={cn(
          "bg-secondary text-secondary-foreground transition-all duration-300 origin-top",
          "hidden lg:flex h-10"
      )}>
        <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className="container mx-auto px-4 flex items-center gap-8 h-full">
            {categoriesData.map((item) => {
                const motherCategoryPath = item.path || `/shop?${createQueryString({ mother_category: item.mother_name })}`;
                return (
                    <div 
                      key={item.mother_name} 
                      className="group relative h-full flex items-center"
                      onMouseEnter={() => setActiveMenu(item.mother_name)}
                      onMouseLeave={() => setActiveMenu(null)}
                    >
                      <Link href={motherCategoryPath} className="h-full flex items-center">
                          <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary">
                              {item.mother_name} <ChevronDown size={12} />
                          </span>
                      </Link>
                    
                      <AnimatePresence>
                        {activeMenu === item.mother_name && (
                           <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              variants={menuVariants}
                              className="fixed top-[108px] left-0 w-full bg-background text-foreground border-t shadow-lg z-[110]"
                              style={{ maxHeight: 'calc(100vh - 108px)', overflowY: 'auto' }}
                            >
                                <div className="container mx-auto grid grid-cols-5 gap-x-10 gap-y-6 p-10">
                                    {item.groups.map(group => (
                                        <motion.div 
                                          key={group.group_name} 
                                          className="col-span-1"
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                        >
                                            <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">
                                                <Link href={`/shop?${createQueryString({ mother_category: item.mother_name, group: group.group_name })}`} className="truncate block">
                                                {group.group_name}
                                                </Link>
                                            </h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground font-body">
                                            {group.subs.map(sub => (
                                                <li key={sub} className="hover:text-primary cursor-pointer">
                                                    <Link href={`/shop?${createQueryString({ mother_category: item.mother_name, group: group.group_name, subcategory: sub })}`} className="truncate block">
                                                        {sub}
                                                    </Link>
                                                </li>
                                            ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                )
            })}
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
