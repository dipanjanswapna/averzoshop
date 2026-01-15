
'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProductGrid } from '@/components/shop/product-grid';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { categoriesData } from '@/lib/data';
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
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';


const heroCarouselImages = PlaceHolderImages.filter(p =>
  p.id.startsWith('hero-carousel-')
);
const bannerImage = PlaceHolderImages.find(p => p.id === 'smart-home-iot-banner');
const CATEGORY_NAME = "Smart Home & IoT";
const PRODUCTS_PER_PAGE = 32;


export default function CategoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');
  
  const parseQueryParam = (param: string | null, defaultValue: any) => {
    if (!param) return defaultValue;
    try {
      return JSON.parse(param);
    } catch (e) {
      return Array.isArray(defaultValue) ? param.split(',') : param;
    }
  };

  const initialFilters = useMemo(() => ({
    page: Number(searchParams.get('page')) || 1,
    sort_by: searchParams.get('sort_by') || 'newest',
    mother_category: CATEGORY_NAME,
    group: searchParams.get('group') || null,
    subcategory: searchParams.get('subcategory') || null,
    brands: parseQueryParam(searchParams.get('brands'), []),
    colors: parseQueryParam(searchParams.get('colors'), []),
    sizes: parseQueryParam(searchParams.get('sizes'), []),
    price_range: parseQueryParam(searchParams.get('price_range'), [0, 5000]),
    discount: searchParams.get('discount') || null,
    is_bundle: searchParams.get('is_bundle') === 'true' || false,
  }), [searchParams]);

  const handleFilterChange = useCallback((filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    params.set(key, key === 'price_range' ? JSON.stringify(value) : value.join(','));
                }
            } else if (String(value).trim() !== '') {
                params.set(key, String(value));
            }
        }
    });

     if(initialFilters.sort_by) {
      params.set('sort_by', initialFilters.sort_by);
    }
    
    // Always keep the base category for this page
    params.set('mother_category', CATEGORY_NAME);
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, initialFilters.sort_by]);


  const handleSortChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sort_by', value);
    } else {
      params.delete('sort_by');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onPageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);


  const { paginatedProducts, totalPages } = useMemo(() => {
    if (!products) return { paginatedProducts: [], totalPages: 0 };

    let filtered = products.filter(p => {
      const productCategoryName = p.category;
      return p.status === 'approved' && (productCategoryName === CATEGORY_NAME || (categoriesData.find(cat => cat.mother_name === CATEGORY_NAME)?.groups.some(g => g.group_name === p.group)));
    });

    if (initialFilters.group) {
        filtered = filtered.filter(p => p.group === initialFilters.group);
    }
    if (initialFilters.subcategory) {
        filtered = filtered.filter(p => p.subcategory === initialFilters.subcategory);
    }
    if (initialFilters.brands.length > 0) {
        filtered = filtered.filter(p => p.brand && initialFilters.brands.includes(p.brand));
    }
    if (initialFilters.colors.length > 0) {
        filtered = filtered.filter(p => p.colors && p.colors.some(color => initialFilters.colors.includes(color)));
    }
    if (initialFilters.sizes.length > 0) {
        filtered = filtered.filter(p => p.sizes && p.sizes.some(size => initialFilters.sizes.includes(size)));
    }
    if (initialFilters.price_range) {
        filtered = filtered.filter(p => p.price >= initialFilters.price_range[0] && p.price <= initialFilters.price_range[1]);
    }
    if (initialFilters.discount) {
        filtered = filtered.filter(p => p.discount >= Number(initialFilters.discount));
    }
    if (initialFilters.is_bundle) {
        filtered = filtered.filter(p => p.isBundle);
    }

    let inStockProducts = filtered.filter(p => p.total_stock > 0);
    const outOfStockProducts = filtered.filter(p => p.total_stock === 0);

    switch (initialFilters.sort_by) {
      case 'price-asc': inStockProducts.sort((a, b) => a.price - b.price); break;
      case 'price-desc': inStockProducts.sort((a, b) => b.price - a.price); break;
      case 'newest': 
      default:
        inStockProducts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const allSortedProducts = [...inStockProducts, ...outOfStockProducts];
    const totalPages = Math.ceil(allSortedProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (initialFilters.page - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = allSortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    return { paginatedProducts, totalPages };
  }, [initialFilters, products]);

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
                <BreadcrumbItem><BreadcrumbPage>{CATEGORY_NAME}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">
                            <Filter className="mr-2 h-4 w-4" /> Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
                      <SheetHeader className="p-6 pb-4">
                        <SheetTitle className="text-xl font-bold font-headline">Filters</SheetTitle>
                      </SheetHeader>
                      <div className="p-6 pt-0">
                        <FilterSidebar categories={categoriesData} onFilterChange={handleFilterChange} initialFilters={initialFilters} />
                      </div>
                    </SheetContent>
                </Sheet>
              <Select value={initialFilters.sort_by} onValueChange={(value) => handleSortChange(value)}>
                <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="price-asc">Sort by: Price Low to High</SelectItem>
                  <SelectItem value="price-desc">Sort by: Price High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <aside className="hidden lg:block lg:col-span-1">
                 <div className="sticky top-28">
                    <FilterSidebar categories={categoriesData} onFilterChange={handleFilterChange} initialFilters={initialFilters} />
                  </div>
               </aside>
              <main className="lg:col-span-3">
                <ProductGrid 
                    products={paginatedProducts} 
                    isLoading={isLoading} 
                    currentPage={initialFilters.page}
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
