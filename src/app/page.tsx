
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  Home,
  LayoutGrid,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AverzoLogo from '@/components/averzo-logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subBrands, products } from '@/lib/data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductCard } from '@/components/product-card';

const featuredProducts = products.slice(0, 4);
const heroCarouselImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-carousel-'));

export default function StoreFrontPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="w-full">
          {/* Desktop Header */}
          <div className="hidden h-16 items-center md:flex container">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <AverzoLogo className="h-7 w-auto" />
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium font-body group">
              <div className="group cursor-pointer">
                  <span className="hover:text-primary transition-colors">MEN</span>
                  {/* Mega Menu Container */}
                  <div className="absolute left-0 w-full bg-background shadow-lg border-t hidden group-hover:grid grid-cols-4 p-10 mt-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <h4 className="font-bold text-primary mb-3 uppercase font-headline">Topwear (Group)</h4>
                      <ul className="space-y-2 text-muted-foreground font-body font-normal">
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">T-Shirts (Subcategory)</li>
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Casual Shirts</li>
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Polos</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-3 uppercase font-headline">Bottomwear</h4>
                      <ul className="space-y-2 text-muted-foreground font-body font-normal">
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Jeans</li>
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Chinos</li>
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Formal Trousers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-3 uppercase font-headline">Featured Brands</h4>
                      <ul className="space-y-2 text-muted-foreground font-body font-normal">
                        <li className="font-bold text-foreground italic">Aura Men</li>
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Levi's</li>
                        <li className="hover:translate-x-1 transition-transform cursor-pointer">Puma</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg flex items-center justify-center">
                      <Image src={PlaceHolderImages.find(p => p.id === 'category-men')?.imageUrl || "https://placehold.co/300x200.png"} width={300} height={200} alt="Ad" className="rounded" data-ai-hint="male fashion" />
                    </div>
                  </div>
              </div>
              <Link href="#" className="transition-colors hover:text-primary">
                Women
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                Kids
              </Link>
              <Link href="#" className="font-bold text-destructive hover:text-destructive/90">
                Sale
              </Link>
            </nav>

            <div className="flex flex-1 items-center justify-end space-x-4">
              <div className="w-full flex-1 max-w-xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for products, brands and more"
                    className="pl-9 bg-secondary border-none"
                  />
                </div>
              </div>
              <nav className="flex items-center space-x-2">
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
              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Open Menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                      {/* TODO: Add Mobile Drawer Content Here (Accordion for categories) */}
                      <div className="p-4">
                          <AverzoLogo className="h-7 w-auto mb-6" />
                          <h2 className="text-lg font-semibold font-headline">Categories</h2>
                      </div>
                  </SheetContent>
              </Sheet>
              <Link href="/">
                  <AverzoLogo className="h-6 w-auto" />
              </Link>
              <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                  </Button>
                  <Link href="/login">
                      <Button variant="ghost" size="icon">
                          <ShoppingCart className="h-5 w-5" />
                          <span className="sr-only">Cart</span>
                      </Button>
                  </Link>
              </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-8 md:py-16">
          <div className="container">
            {/* --- Story Circles --- */}
            <div className="flex space-x-4 overflow-x-auto pb-4 md:justify-center">
              {subBrands.map((brand) => (
                <Link href="#" key={brand.id} className="flex flex-col items-center space-y-2 flex-shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={`https://picsum.photos/seed/${brand.id}/100/100`} alt={brand.name} />
                    <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium font-body">{brand.name}</span>
                </Link>
              ))}
            </div>

            {/* --- Hero Carousel --- */}
            <div className="mt-8">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {heroCarouselImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <Link href={image.link || '#'}>
                        <div className="relative w-full aspect-[4/1] rounded-lg overflow-hidden">
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            data-ai-hint={image.imageHint}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <CarouselPrevious className="static -translate-y-0" />
                    <CarouselNext className="static -translate-y-0" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-extrabold">Deals Of The Day</h2>
              <p className="mt-2 text-muted-foreground">Don't miss out on these limited-time offers.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
               <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow duration-300 group">
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
                        <Link href="#" className="flex flex-col items-center">
                           <ArrowRight className="h-8 w-8 text-primary"/>
                           <span className="font-bold text-primary mt-2">View All</span>
                        </Link>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </section>
      </main>
      
      {/* --- Mobile Bottom Navigation --- */}
      <nav className="fixed bottom-0 z-50 w-full border-t bg-background md:hidden">
        <div className="grid h-16 grid-cols-5">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 text-primary">
                <Home className="h-6 w-6" />
                <span className="text-xs font-medium">Home</span>
            </Link>
            <Link href="#" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <LayoutGrid className="h-6 w-6" />
                <span className="text-xs font-medium">Categories</span>
            </Link>
            <Link href="#" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ShoppingBag className="h-6 w-6" />
                <span className="text-xs font-medium">Brands</span>
            </Link>
             <Link href="/dashboard/orders" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs font-medium">Bag</span>
            </Link>
            <Link href="/login" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <User className="h-6 w-6" />
                <span className="text-xs font-medium">Profile</span>
            </Link>
        </div>
      </nav>

      {/* --- Desktop Footer --- */}
      <footer className="bg-secondary text-secondary-foreground hidden md:block">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <AverzoLogo className="h-7 w-auto" />
              <p className="mt-4 text-sm text-muted-foreground font-body">The future of fashion and retail.</p>
            </div>
            <div>
              <h3 className="font-semibold font-headline">Shop</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Men</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Women</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Kids</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline">About</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline">Support</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground font-body">
            <p>&copy; {new Date().getFullYear()} Averzo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
