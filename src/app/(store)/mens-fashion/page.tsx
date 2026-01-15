
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { ProductGrid } from '@/components/shop/product-grid';
import { products } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { categoriesData } from '@/lib/categories';

const heroCarouselImages = PlaceHolderImages.filter(p =>
  p.id.startsWith('hero-carousel-')
);
const bannerImage = PlaceHolderImages.find(p => p.id === 'mens-fashion-banner');

const PRODUCTS_PER_PAGE = 32;

export default function MensFashionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Default filter for this page
  const defaultMotherCategory = "Men's Fashion";

  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0,1000]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMotherCategory, setSelectedMotherCategory] = useState<string | null>(defaultMotherCategory);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const updateStateFromParams = useCallback(() => {
    setPriceRange([Number(searchParams.get('min_price') || 0), Number(searchParams.get('max_price') || 1000)]);
    setSelectedBrand(searchParams.get('brand'));
    setSelectedGroup(searchParams.get('group'));
    setSelectedSubcategory(searchParams.get('subcategory'));
    setSortBy(searchParams.get('sort_by') || 'newest');
    setCurrentPage(Number(searchParams.get('page') || 1));
    setSelectedMotherCategory(defaultMotherCategory);
    setLoading(false);
  }, [searchParams, defaultMotherCategory]);

  // Sync state from URL on initial load and param changes
  useEffect(() => {
    updateStateFromParams();
  }, [searchParams, updateStateFromParams]);

   const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Update URL from state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    const updateParam = (key: string, value: string | null | undefined) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };
    
    updateParam('brand', selectedBrand);
    updateParam('group', selectedGroup);
    updateParam('subcategory', selectedSubcategory);
    updateParam('sort_by', sortBy === 'newest' ? null : sortBy);
    updateParam('page', currentPage > 1 ? String(currentPage) : null);

    if (priceRange[0] > 0) {
      params.set('min_price', String(priceRange[0]));
    } else {
        params.delete('min_price');
    }
    if (priceRange[1] < 1000) {
      params.set('max_price', String(priceRange[1]));
    } else {
        params.delete('max_price');
    }

    if (searchParams.toString() !== params.toString()) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedBrand, selectedGroup, selectedSubcategory, priceRange, sortBy, currentPage, pathname, router, searchParams]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    let filtered = products.filter(p => p.category === "Men" || (selectedMotherCategory && p.group && categoriesData.find(cat => cat.mother_name === selectedMotherCategory)?.groups.some(g => g.group_name === p.group)));

    let inStockProducts = filtered.filter(p => p.stock > 0);
    const outOfStockProducts = filtered.filter(p => p.stock === 0);

    if (selectedBrand) {
      inStockProducts = inStockProducts.filter(p => p.group === selectedBrand);
    }
    if (selectedGroup) {
       inStockProducts = inStockProducts.filter(p => p.group === selectedGroup);
    }
    if (selectedSubcategory) {
       inStockProducts = inStockProducts.filter(p => p.subcategory === selectedSubcategory);
    }

    inStockProducts = inStockProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
        case 'price-asc':
            inStockProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            inStockProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            inStockProducts.reverse();
            break;
    }

    const allSortedProducts = [...inStockProducts, ...outOfStockProducts];
    
    const totalPages = Math.ceil(allSortedProducts.length / PRODUCTS_PER_PAGE);
    
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    
    const paginatedProducts = allSortedProducts.slice(startIndex, endIndex);

    return { paginatedProducts, totalPages };
  }, [selectedBrand, selectedGroup, selectedSubcategory, priceRange, sortBy, selectedMotherCategory, currentPage]);

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-8 mb-8 md:pt-12 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
            Men's Fashion
          </h1>
        </div>

        {/* --- Hero Carousel --- */}
        <div className="mb-8">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {heroCarouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Link href={image.link || '#'}>
                    <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-lg overflow-hidden">
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

        {/* --- Banner Image --- */}
        {bannerImage && (
            <div className="mb-8">
                <Link href={bannerImage.link || '#'}>
                    <div className="relative w-full aspect-[6/1] rounded-lg overflow-hidden">
                        <Image
                            src={bannerImage.imageUrl}
                            alt={bannerImage.description}
                            data-ai-hint={bannerImage.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
                </Link>
            </div>
        )}
      </div>
      
      <div className="bg-secondary py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{defaultMotherCategory}</BreadcrumbPage>
                  </BreadcrumbItem>
                  {selectedGroup && <BreadcrumbSeparator />}
                  {selectedGroup && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{selectedGroup}</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                  {selectedSubcategory && <BreadcrumbSeparator />}
                  {selectedSubcategory && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{selectedSubcategory}</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 lg:hidden"
                    >
                      <Filter size={16} />
                      <span>Filter</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%] sm:max-w-sm p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle>Filter & Sort</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-80px)] overflow-y-auto">
                      <FilterSidebar
                        isLoading={loading}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedBrand={selectedBrand}
                        setSelectedBrand={setSelectedBrand}
                        selectedMotherCategory={selectedMotherCategory}
                        setSelectedMotherCategory={setSelectedMotherCategory}
                        selectedGroup={selectedGroup}
                        setSelectedGroup={setSelectedGroup}
                        selectedSubcategory={selectedSubcategory}
                        setSelectedSubcategory={setSelectedSubcategory}
                      />
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Sort by: Newest</SelectItem>
                    <SelectItem value="popularity">Sort by: Popularity</SelectItem>
                    <SelectItem value="price-asc">
                      Sort by: Price Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Sort by: Price High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-28">
                  <FilterSidebar
                    isLoading={loading}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedMotherCategory={selectedMotherCategory}
                    setSelectedMotherCategory={setSelectedMotherCategory}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    selectedSubcategory={selectedSubcategory}
                    setSelectedSubcategory={setSelectedSubcategory}
                  />
                </div>
              </aside>

              <main className="lg:col-span-3">
                 <ProductGrid 
                    products={paginatedProducts} 
                    isLoading={loading} 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
              </main>
            </div>
        </div>
      </div>
    </div>
  );
}
