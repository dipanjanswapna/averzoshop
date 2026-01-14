import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AverzoLogo from '@/components/averzo-logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const featuredProducts = PlaceHolderImages.filter(p =>
  ['product-1', 'product-2', 'product-3', 'product-4'].includes(p.id)
);
const categoryImages = PlaceHolderImages.filter(p =>
  ['category-men', 'category-women', 'category-kids'].includes(p.id)
);
const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');

export default function StoreFrontPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <AverzoLogo className="h-6 w-auto" />
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Men
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Women
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Kids
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Sale
              </Link>
            </nav>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <Link href="/" className="mr-6 flex items-center space-x-2 px-6">
                  <AverzoLogo className="h-6 w-auto" />
                </Link>
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start">Men</Button>
                    <Button variant="ghost" className="w-full justify-start">Women</Button>
                    <Button variant="ghost" className="w-full justify-start">Kids</Button>
                    <Button variant="ghost" className="w-full justify-start">Sale</Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>
            </div>
            <nav className="flex items-center">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-[60vh] w-full md:h-[80vh]">
          {heroImage && <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />}
          <div className="absolute inset-0 bg-black/40" />
          <div className="container relative z-10 flex h-full items-center justify-center text-center text-white md:justify-start md:text-left">
            <div className="max-w-xl">
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                Style for Every Story
              </h1>
              <p className="mt-6 max-w-lg text-lg text-slate-200">
                Discover the new collection from Aura and find the perfect look for any occasion.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
                <Button size="lg">Shop Now</Button>
                <Button size="lg" variant="secondary">
                  Explore Brands
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold">Featured Products</h2>
              <p className="mt-2 text-muted-foreground">Check out our most popular items</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/5] w-full">
                       <Image
                          src={product.imageUrl}
                          alt={product.description}
                          data-ai-hint={product.imageHint}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">Aura Men's T-Shirt</h3>
                      <p className="text-sm text-muted-foreground">Classic Cotton</p>
                      <p className="mt-2 font-bold">$29.99</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="bg-muted py-16 md:py-24">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold">Shop by Category</h2>
              <p className="mt-2 text-muted-foreground">Find what you're looking for</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {categoryImages.map((category, index) => (
                <Link href="#" key={category.id} className="group relative block">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={category.imageUrl}
                      alt={category.description}
                      data-ai-hint={category.imageHint}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white font-headline">
                      {['Men', 'Women', 'Kids'][index]}
                    </h3>
                    <p className="mt-1 flex items-center text-sm font-medium text-white">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary text-secondary-foreground">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <AverzoLogo className="h-7 w-auto" />
              <p className="mt-4 text-sm">The future of fashion and retail.</p>
            </div>
            <div>
              <h3 className="font-semibold">Shop</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary">Men</Link></li>
                <li><Link href="#" className="hover:text-primary">Women</Link></li>
                <li><Link href="#" className="hover:text-primary">Kids</Link></li>
                <li><Link href="#" className="hover:text-primary">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">About</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary">Our Story</Link></li>
                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="hover:text-primary">Shipping & Returns</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Averzo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
