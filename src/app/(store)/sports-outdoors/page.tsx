
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
const bannerImage = PlaceHolderImages.find(p => p.id === 'sports-outdoors-banner');
const CATEGORY_NAME = "Sports & Outdoors";
const PRODUCTS_PER_PAGE = 32;


export default function CategoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const defaultMotherCategory = CATEGORY_NAME;

  const priceRange = useMemo(() => [Number(searchParams.get('min_price') || 0), Number(searchParams.get('max_price') || 1000)], [searchParams]);
  const selectedBrand = useMemo(() => searchParams.get('brand'), [searchParams]);
  const selectedMotherCategory = defaultMotherCategory;
  const selectedGroup = useMemo(() => searchParams.get('group'), [searchParams]);
  const selectedSubcategory = useMemo(() => searchParams.get('subcategory'), [searchParams]);
  const sortBy = useMemo(() => searchParams.get('sort_by') || 'newest', [searchParams]);
  const currentPage = useMemo(() => Number(searchParams.get('page') || 1), [searchParams]);

  const handleFilterChange = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handlePriceChange = useCallback((newRange: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRange[0] > 0) params.set('min_price', String(newRange[0]));
    else params.delete('min_price');
    if (newRange[1] < 1000) params.set('max_price', String(newRange[1]));
    else params.delete('max_price');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const onPageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    let filtered = products.filter(p => {
      const productCategoryName = p.category;
      return productCategoryName === CATEGORY_NAME || (selectedMotherCategory && categoriesData.find(cat => cat.mother_name === selectedMotherCategory)?.groups.some(g => g.group_name === p.group));
    });

    let inStockProducts = filtered.filter(p => p.stock > 0);
    const outOfStockProducts = filtered.filter(p => p.stock === 0);

    if (selectedBrand) inStockProducts = inStockProducts.filter(p => p.group === selectedBrand);
    if (selectedGroup) inStockProducts = inStockProducts.filter(p => p.group === selectedGroup);
    if (selectedSubcategory) inStockProducts = inStockProducts.filter(p => p.subcategory === selectedSubcategory);
    inStockProducts = inStockProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': inStockProducts.sort((a, b) => a.price - b.price); break;
      case 'price-desc': inStockProducts.sort((a, b) => b.price - a.price); break;
      case 'newest': inStockProducts.reverse(); break;
    }

    const allSortedProducts = [...inStockProducts, ...outOfStockProducts];
    const totalPages = Math.ceil(allSortedProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = allSortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    return { paginatedProducts, totalPages };
  }, [selectedBrand, selectedGroup, selectedSubcategory, priceRange, sortBy, selectedMotherCategory, currentPage]);

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-8 mb-8 md:pt-12 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
            {CATEGORY_NAME}
          </h1>
        </div>

        <div className="mb-8">
          <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 4000 })]} className="w-full">
            <CarouselContent>
              {heroCarouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Link href={image.link || '#'}>
                    <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-lg overflow-hidden">
                      <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" priority={index === 0} />
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

        {bannerImage && (
          <div className="mb-8">
            <Link href={bannerImage.link || '#'}>
              <div className="relative w-full aspect-[6/1] rounded-lg overflow-hidden">
                <Image src={bannerImage.imageUrl} alt={bannerImage.description} data-ai-hint={bannerImage.imageHint} fill className="object-cover" />
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
                <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/shop">Shop</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{defaultMotherCategory}</BreadcrumbPage></BreadcrumbItem>
                {selectedGroup && <><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{selectedGroup}</BreadcrumbPage></BreadcrumbItem></>}
                {selectedSubcategory && <><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{selectedSubcategory}</BreadcrumbPage></BreadcrumbItem></>}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 lg:hidden"><Filter size={16} /><span>Filter</span></Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:max-w-sm p-0">
                  <SheetHeader className="p-4 border-b"><SheetTitle>Filter & Sort</SheetTitle></SheetHeader>
                  <ScrollArea className="h-[calc(100vh-80px)] overflow-y-auto">
                    <FilterSidebar 
                      categories={categoriesData}
                      priceRange={priceRange as [number, number]} 
                      onPriceChange={handlePriceChange} 
                      selectedBrand={selectedBrand} 
                      onBrandChange={(brand) => handleFilterChange('brand', brand)} 
                      selectedMotherCategory={selectedMotherCategory} 
                      onMotherCategoryChange={(cat) => handleFilterChange('mother_category', cat)} 
                      selectedGroup={selectedGroup} 
                      onGroupChange={(group) => handleFilterChange('group', group)} 
                      selectedSubcategory={selectedSubcategory} 
                      onSubcategoryChange={(sub) => handleFilterChange('subcategory', sub)} 
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort_by', value)}>
                <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="popularity">Sort by: Popularity</SelectItem>
                  <SelectItem value="price-asc">Sort by: Price Low to High</SelectItem>
                  <SelectItem value="price-desc">Sort by: Price High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28">
                <FilterSidebar 
                  categories={categoriesData}
                  priceRange={priceRange as [number, number]} 
                  onPriceChange={handlePriceChange} 
                  selectedBrand={selectedBrand} 
                  onBrandChange={(brand) => handleFilterChange('brand', brand)} 
                  selectedMotherCategory={selectedMotherCategory} 
                  onMotherCategoryChange={(cat) => handleFilterChange('mother_category', cat)} 
                  selectedGroup={selectedGroup} 
                  onGroupChange={(group) => handleFilterChange('group', group)} 
                  selectedSubcategory={selectedSubcategory} 
                  onSubcategoryChange={(sub) => handleFilterChange('subcategory', sub)} 
                />
              </div>
            </aside>
            <main className="lg:col-span-3">
              <ProductGrid products={paginatedProducts} isLoading={false} currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
