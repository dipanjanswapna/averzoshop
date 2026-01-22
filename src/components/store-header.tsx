"use client";
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, ChevronDown, X, ChevronRight, Zap, Sun, Moon, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { categoriesData } from '@/lib/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/use-cart';
import { useTheme } from '@/components/providers';
import { LiveSearch } from './live-search';
import { UserNav } from './user-nav';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';


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


const MobileSidebar = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-[160] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex items-center justify-between p-5 border-b bg-foreground text-background">
          <span className="text-xl font-black font-saira uppercase">Averzo.</span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="h-[calc(100vh-70px)] overflow-y-auto pb-10">
          
          <div className="p-5 border-b flex items-center gap-3">
             {user ? (
               <Link href="/customer" onClick={onClose} className="flex items-center gap-3 w-full">
                 <Avatar>
                   <AvatarImage src={user.photoURL || undefined} />
                   <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                 </Avatar>
                 <div>
                   <p className="text-sm font-bold text-foreground">{user.displayName}</p>
                   <p className="text-xs text-muted-foreground">{user.email}</p>
                 </div>
               </Link>
             ) : (
                <Link href="/login" onClick={onClose} className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">Welcome, Guest</p>
                        <p className="text-xs text-muted-foreground">Login to your account</p>
                    </div>
                </Link>
             )}
          </div>

          <Link href="/track-order" onClick={onClose} className="block p-4 text-center text-sm font-bold text-primary bg-primary/10 border-b">
            Track Your Order
          </Link>

          <Link href="/flash-sale" onClick={onClose} className="block p-4 bg-destructive/10 text-destructive font-bold text-center uppercase tracking-widest text-xs">
            ⚡ Flash Sale is Live!
          </Link>

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
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
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
      
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 h-[68px]">
        {/* Left Part */}
        <div className="flex items-center gap-2">
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
        
        {/* Center Part (Desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-start gap-8">
            <div className="w-full max-w-sm">
                <LiveSearch />
            </div>
            <nav className="flex items-center gap-2">
                <Link href="/shop">
                    <Button variant="ghost" className="font-bold text-sm uppercase tracking-wider hover:bg-primary/10 hover:text-primary">
                        Shop
                    </Button>
                </Link>
                <Link href="/track-order">
                    <Button variant="ghost" className="font-bold text-sm uppercase tracking-wider hover:bg-primary/10 hover:text-primary">
                        Track Order
                    </Button>
                </Link>
            </nav>
        </div>

        {/* Right Part */}
        <div className="flex items-center gap-1">
             <div className="lg:hidden">
                <LiveSearch trigger={
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Search size={22}/>
                    </Button>}
                />
            </div>
          
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="h-9 w-9"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <UserNav />

        </div>
      </div>
      
      {/* Category Nav */}
      <nav 
        className={cn(
          "bg-secondary text-secondary-foreground transition-all duration-300 origin-top",
          "hidden lg:flex h-10"
      )}
      onMouseLeave={() => setActiveMenu(null)}>
        <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className="container mx-auto flex items-center gap-8 h-full">
              <Link href="/flash-sale" className="h-full flex items-center">
                <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-1 text-destructive animate-pulse">
                  <Zap size={14} /> Flash Sale
                </span>
              </Link>
            {categoriesData.map((item) => {
                const motherCategoryPath = item.path || `/shop?${createQueryString({ mother_category: item.mother_name })}`;
                return (
                    <div 
                      key={item.mother_name} 
                      className="group relative h-full flex items-center"
                      onMouseEnter={() => setActiveMenu(item.mother_name)}
                    >
                      <Link href={motherCategoryPath} className="h-full flex items-center">
                          <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary">
                              {item.mother_name} <ChevronDown size={12} />
                          </span>
                      </Link>
                    </div>
                )
            })}
            </div>
        </div>
      </nav>
      
      {/* Mega Menu */}
      {activeMenu && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={menuVariants}
          className="fixed top-[108px] left-0 w-full bg-background text-foreground border-t shadow-lg z-[110]"
          onMouseEnter={() => setActiveMenu(activeMenu)}
          onMouseLeave={() => setActiveMenu(null)}
          style={{ maxHeight: 'calc(100vh - 108px)', overflowY: 'auto' }}
        >
            <div className="container mx-auto grid grid-cols-5 gap-x-10 gap-y-6 p-10">
                {(categoriesData.find(c => c.mother_name === activeMenu)?.groups || []).map(group => (
                    <motion.div 
                      key={group.group_name} 
                      className="col-span-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                        <h4 className="font-bold text-primary mb-4 border-b pb-2 text-xs uppercase">
                            <Link href={`/shop?${createQueryString({ mother_category: activeMenu, group: group.group_name })}`} className="truncate block">
                            {group.group_name}
                            </Link>
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground font-body">
                        {group.subs.map(sub => (
                            <li key={sub} className="hover:text-primary cursor-pointer">
                                <Link href={`/shop?${createQueryString({ mother_category: activeMenu, group: group.group_name, subcategory: sub })}`} className="truncate block">
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

       <MobileSidebar 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          user={user}
        />
    </header>
  );
}
