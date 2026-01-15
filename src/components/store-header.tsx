
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

const categories = [
  'MEN', 'WOMEN', 'KIDS', 'ELECTRONICS', 'HEALTH & WELLNESS', 'PET CARE'
];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        {/* --- DESKTOP HEADER --- */}
        <div className="hidden lg:block">
          {/* Top Bar */}
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
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
          <div className="border-t bg-background">
            <div className="container flex items-center justify-center space-x-4">
              {categories.map((category) => (
                <div key={category} className="group relative cursor-pointer py-4">
                  <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm">
                    {category} <ChevronDown size={16} />
                  </span>
                  {/* --- Mega Menu --- */}
                  <div className="absolute left-0 top-full w-screen opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto transform group-hover:translate-y-0 translate-y-2">
                     <div className="bg-background shadow-lg border-t mt-0">
                        <div className="container mx-auto px-4 py-8">
                           <div className="grid grid-cols-5 gap-8">
                              {/* Promo Section */}
                              <div className="col-span-1 bg-secondary rounded-lg p-6">
                                 <h3 className="font-bold text-lg font-headline">{category}'s Fashion</h3>
                                 <p className="text-muted-foreground mt-2 text-sm">Explore the latest trends in {category.toLowerCase()}'s apparel and accessories.</p>
                                  <Button size="sm" className="mt-4">Shop Now</Button>
                              </div>
                              {/* Links Section */}
                              <div className="col-span-1">
                                 <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">Topwear</h4>
                                 <ul className="space-y-3 text-muted-foreground text-sm">
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">T-Shirts</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Casual Shirts</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Polos</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Formal Shirts</li>
                                 </ul>
                              </div>
                              <div className="col-span-1">
                                 <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">Bottomwear</h4>
                                 <ul className="space-y-3 text-muted-foreground text-sm">
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Jeans</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Chinos</li>
                                     <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Shorts</li>
                                 </ul>
                              </div>
                              <div className="col-span-1">
                                 <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">Footwear</h4>
                                 <ul className="space-y-3 text-muted-foreground text-sm">
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Sneakers</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Formal Shoes</li>
                                 </ul>
                              </div>
                               <div className="col-span-1">
                                 <h4 className="font-bold text-primary mb-4 uppercase font-headline text-sm tracking-wider">Accessories</h4>
                                 <ul className="space-y-3 text-muted-foreground text-sm">
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Watches</li>
                                    <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground font-medium">Belts</li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
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

    