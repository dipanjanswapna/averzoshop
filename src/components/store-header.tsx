
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AverzoLogo from '@/components/averzo-logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        {/* --- DESKTOP HEADER --- */}
        <div className="hidden lg:block">
          <div className="container">
            {/* Top Bar */}
            <div className="flex h-16 items-center justify-between">
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
          </div>
          {/* Category Bar */}
           <div className="border-t bg-background">
             <div className="container">
                <nav className="flex items-center space-x-1">
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Open Menu</span>
                      </Button>
                  </SheetTrigger>
                  <div className="group relative cursor-pointer p-2">
                      <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">MEN <ChevronDown size={16}/></span>
                      {/* Mega Menu Container */}
                      <div className="absolute left-0 top-full w-screen max-w-7xl bg-background shadow-lg border hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-5 gap-x-8 p-10">
                            <div className="col-span-1 p-6 bg-secondary rounded-lg">
                                <AverzoLogo className="h-8 w-auto mb-4" />
                                <h3 className="font-bold text-2xl font-headline">Men's Fashion</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Explore the latest trends in men's apparel and accessories.</p>
                            </div>
                            <div className="col-span-4 grid grid-cols-3 gap-x-8">
                                <div>
                                <h4 className="font-bold text-primary mb-3 uppercase font-headline">Topwear</h4>
                                <ul className="space-y-2 text-muted-foreground font-body font-normal">
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">T-Shirts</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Casual Shirts</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Polos</li>
                                </ul>
                                </div>
                                <div>
                                <h4 className="font-bold text-primary mb-3 uppercase font-headline">Bottomwear</h4>
                                <ul className="space-y-2 text-muted-foreground font-body font-normal">
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Jeans</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Chinos</li>
                                </ul>
                                </div>
                                <div>
                                <h4 className="font-bold text-primary mb-3 uppercase font-headline">Featured Brands</h4>
                                 <div className="bg-muted p-4 rounded-lg flex items-center justify-center">
                                    <Image src={PlaceHolderImages.find(p => p.id === 'category-men')?.imageUrl || "https://placehold.co/300x200.png"} width={300} height={200} alt="Ad" className="rounded object-cover" data-ai-hint="male fashion" />
                                 </div>
                                </div>
                            </div>
                        </div>
                      </div>
                  </div>
                  <div className="group relative cursor-pointer p-2">
                    <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">WOMEN <ChevronDown size={16}/></span>
                  </div>
                  <div className="group relative cursor-pointer p-2">
                    <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">KIDS <ChevronDown size={16}/></span>
                  </div>
                   <div className="group relative cursor-pointer p-2">
                    <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">ELECTRONICS <ChevronDown size={16}/></span>
                  </div>
                   <div className="group relative cursor-pointer p-2">
                    <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">HEALTH & WELLNESS <ChevronDown size={16}/></span>
                  </div>
                  <div className="group relative cursor-pointer p-2">
                    <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">PET CARE <ChevronDown size={16}/></span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <div className="group relative cursor-pointer p-2">
                          <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">MORE <ChevronDown size={16}/></span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                       <DropdownMenuItem>Home & Living</DropdownMenuItem>
                       <DropdownMenuItem>Beauty</DropdownMenuItem>
                       <DropdownMenuItem>Sports</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
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
                      <AccordionItem value="men">
                          <AccordionTrigger className="font-bold text-base">MEN</AccordionTrigger>
                          <AccordionContent>
                              <Accordion type="multiple" className="w-full pl-4">
                                  <AccordionItem value="topwear">
                                      <AccordionTrigger>Topwear</AccordionTrigger>
                                      <AccordionContent className="pl-4">
                                          <ul className="space-y-2 text-muted-foreground">
                                              <li className="hover:text-foreground"><Link href="#">T-Shirts</Link></li>
                                              <li className="hover:text-foreground"><Link href="#">Casual Shirts</Link></li>
                                          </ul>
                                      </AccordionContent>
                                  </AccordionItem>
                                  <AccordionItem value="bottomwear">
                                      <AccordionTrigger>Bottomwear</AccordionTrigger>
                                      <AccordionContent className="pl-4">
                                          <ul className="space-y-2 text-muted-foreground">
                                              <li className="hover:text-foreground"><Link href="#">Jeans</Link></li>
                                              <li className="hover:text-foreground"><Link href="#">Chinos</Link></li>
                                          </ul>
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="women">
                          <AccordionTrigger className="font-bold text-base">WOMEN</AccordionTrigger>
                          <AccordionContent>
                              <p className="text-muted-foreground pl-4">...Women categories here</p>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="kids">
                          <AccordionTrigger className="font-bold text-base">KIDS</AccordionTrigger>
                          <AccordionContent>
                              <p className="text-muted-foreground pl-4">...Kids categories here</p>
                          </AccordionContent>
                      </AccordionItem>
                       <AccordionItem value="electronics">
                          <AccordionTrigger className="font-bold text-base">ELECTRONICS</AccordionTrigger>
                          <AccordionContent>
                               <Accordion type="multiple" className="w-full pl-4">
                                  <AccordionItem value="mobiles">
                                      <AccordionTrigger>Mobiles</AccordionTrigger>
                                      <AccordionContent className="pl-4">
                                          <ul className="space-y-2 text-muted-foreground">
                                              <li className="hover:text-foreground"><Link href="#">Smartphones</Link></li>
                                              <li className="hover:text-foreground"><Link href="#">Feature Phones</Link></li>
                                          </ul>
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          </AccordionContent>
                      </AccordionItem>
                       <AccordionItem value="health">
                          <AccordionTrigger className="font-bold text-base">HEALTH &amp; WELLNESS</AccordionTrigger>
                          <AccordionContent>
                              <Accordion type="multiple" className="w-full pl-4">
                                  <AccordionItem value="supplements">
                                      <AccordionTrigger>Supplements</AccordionTrigger>
                                      <AccordionContent className="pl-4">
                                          <ul className="space-y-2 text-muted-foreground">
                                              <li className="hover:text-foreground"><Link href="#">Whey Protein</Link></li>
                                              <li className="hover:text-foreground"><Link href="#">Vitamins</Link></li>
                                          </ul>
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="pet-care">
                          <AccordionTrigger className="font-bold text-base">PET CARE</AccordionTrigger>
                          <AccordionContent>
                             <Accordion type="multiple" className="w-full pl-4">
                                  <AccordionItem value="cat-essentials">
                                      <AccordionTrigger>Cat Essentials</AccordionTrigger>
                                      <AccordionContent className="pl-4">
                                          <ul className="space-y-2 text-muted-foreground">
                                              <li className="hover:text-foreground"><Link href="#">Cat Food</Link></li>
                                              <li className="hover:text-foreground"><Link href="#">Litter Box</Link></li>
                                          </ul>
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
                      <div className="mt-6 border-t pt-6">
                      <Link href="#" className="font-bold text-base text-destructive">SALE</Link>
                      </div>
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
