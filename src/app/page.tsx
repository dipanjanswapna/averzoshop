
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
import { subBrands } from '@/lib/data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const featuredProducts = PlaceHolderImages.filter(p =>
  ['product-1', 'product-2', 'product-3', 'product-4'].includes(p.id)
);
const heroCarouselImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-carousel-'));

export default function StoreFrontPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* --- Desktop Header --- */}
      <header className="sticky top-0 z-50 hidden w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AverzoLogo className="h-7 w-auto" />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium font-body">
            <Link href="#" className="transition-colors hover:text-primary">
              Men
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Women
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Kids
            </Link>
            <Link href="#" className="font-bold text-primary hover:text-primary/90">
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
      </header>

      {/* --- Mobile Header --- */}
       <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <Link href="/">
          <AverzoLogo className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>
             <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
            </Button>
             <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
            </Button>
        </div>
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {featuredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow duration-300 group">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] w-full">
                       <Image
                          src={product.imageUrl}
                          alt={product.description}
                          data-ai-hint={product.imageHint}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-2 left-2 bg-background/80 p-2 rounded-md">
                            <h3 className="font-semibold text-sm leading-tight font-body">Aura T-Shirt</h3>
                            <p className="text-xs text-muted-foreground">New Collection</p>
                            <p className="mt-1 font-bold text-sm">$29.99</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
               <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow duration-300 group">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] w-full bg-muted flex items-center justify-center">
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
                <ShoppingBag className="h-6 w-6" />
                <span className="text-xs font-medium">Orders</span>
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
