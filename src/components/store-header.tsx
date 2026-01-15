
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
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        <div className="container">
          {/* Desktop & Tablet Header */}
          <div className="hidden h-16 items-center md:flex">
            <Link href="/" className="mr-2 flex items-center space-x-2">
              <AverzoLogo className="h-7 w-auto" />
            </Link>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            
            <div className="flex-1 px-4 lg:px-8">
              <Carousel
                opts={{
                  align: 'start',
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  <CarouselItem className="basis-auto pl-2">
                    <div className="group relative cursor-pointer p-2">
                        <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base">MEN <ChevronDown size={16}/></span>
                        {/* Mega Menu Container */}
                        <div className="absolute left-0 top-full w-full max-w-7xl bg-background shadow-lg border-t hidden group-hover:grid grid-cols-4 gap-x-8 p-10 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Topwear (Group)</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">T-Shirts (Subcategory)</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Casual Shirts</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Polos</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Bottomwear</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Jeans</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Chinos</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Formal Trousers</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Featured Brands</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="font-bold text-foreground italic">Aura Men</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Levi's</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Puma</li>
                            </ul>
                          </div>
                          <div className="bg-muted p-4 rounded-lg flex items-center justify-center">
                            <Image src={PlaceHolderImages.find(p => p.id === 'category-men')?.imageUrl || "https://placehold.co/300x200.png"} width={300} height={200} alt="Ad" className="rounded object-cover" data-ai-hint="male fashion" />
                          </div>
                        </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-auto pl-2">
                     <div className="group relative cursor-pointer p-2">
                      <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base">Women <ChevronDown size={16}/></span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-auto pl-2">
                     <div className="group relative cursor-pointer p-2">
                      <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base">Kids <ChevronDown size={16}/></span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-auto pl-2">
                     <div className="group relative cursor-pointer p-2">
                        <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base">Electronics <ChevronDown size={16}/></span>
                         <div className="absolute left-0 top-full w-full bg-background shadow-lg border-t hidden group-hover:grid grid-cols-4 gap-x-8 p-10 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Mobiles</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Smartphones</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Feature Phones</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Laptops</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Gaming Laptops</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Ultrabooks</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Featured Brands</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Samsung</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">HP</li>
                            </ul>
                          </div>
                           <div className="bg-muted p-4 rounded-lg flex items-center justify-center">
                            <Image src={"https://picsum.photos/seed/electronics/300/200"} width={300} height={200} alt="Electronics Ad" className="rounded object-cover" data-ai-hint="electronics gadget" />
                          </div>
                        </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-auto pl-2">
                     <div className="group relative cursor-pointer p-2">
                        <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base">Health &amp; Wellness <ChevronDown size={16}/></span>
                        <div className="absolute left-0 top-full w-full bg-background shadow-lg border-t hidden group-hover:grid grid-cols-4 gap-x-8 p-10 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Supplements</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Whey Protein</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Vitamins</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Pre-workout</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Fitness Gear</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Yoga Mat</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Resistance Band</li>
                            </ul>
                          </div>
                           <div className="bg-muted p-4 rounded-lg flex items-center justify-center col-span-2">
                             <Image src={"https://picsum.photos/seed/health/600/200"} width={600} height={200} alt="Health Ad" className="rounded object-cover" data-ai-hint="health fitness" />
                          </div>
                        </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-auto pl-2">
                     <div className="group relative cursor-pointer p-2">
                        <span className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base">Pet Care <ChevronDown size={16}/></span>
                         <div className="absolute left-0 top-full w-full bg-background shadow-lg border-t hidden group-hover:grid grid-cols-4 gap-x-8 p-10 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Cat Essentials</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Cat Food</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Litter Box</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Toys</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-3 uppercase font-headline">Dog Essentials</h4>
                            <ul className="space-y-2 text-muted-foreground font-body font-normal">
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Dog Treats</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Leash</li>
                              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-foreground">Shampoo</li>
                            </ul>
                          </div>
                           <div className="bg-muted p-4 rounded-lg flex items-center justify-center col-span-2">
                             <Image src={"https://picsum.photos/seed/pets/600/200"} width={600} height={200} alt="Pet Care Ad" className="rounded object-cover" data-ai-hint="cute pet" />
                          </div>
                        </div>
                      </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0"/>
              </Carousel>
            </div>


            <div className="flex flex-1 items-center justify-end space-x-1 lg:space-x-2">
              <div className="w-full flex-1 max-w-xs hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for products, brands and more"
                    className="pl-9 bg-secondary border-none"
                  />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Deals</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuItem>Track Order</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <nav className="flex items-center space-x-0 lg:space-x-1">
                <Link href="/login">
                  <Button variant="ghost" className="flex flex-col h-auto p-1 items-center space-y-1">
                    <User className="h-5 w-5" />
                    <span className="text-xs font-medium">Profile</span>
                  </Button>
                </Link>
                <Button variant="ghost" className="flex flex-col h-auto p-1 items-center space-y-1">
                  <Heart className="h-5 w-5" />
                  <span className="text-xs font-medium">Wishlist</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-auto p-1 items-center space-y-1">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs font-medium">Bag</span>
                </Button>
              </nav>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex h-14 items-center justify-between px-4 md:hidden">
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
        </div>
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

    