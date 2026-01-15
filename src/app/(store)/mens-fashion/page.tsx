
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  
  const defaultMotherCategory = "Men's Fashion";

  const sortBy = useMemo(() => searchParams.get('sort_by') || 'newest', [searchParams]);
  const currentPage = useMemo(() => Number(searchParams.get('page') || 1), [searchParams]);


  const handleSortChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sort_by', value);
    } else {
      params.delete('sort_by');
    }
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onPageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    let filtered = products.filter(p => p.category === "Men" || (p.group && categoriesData.find(cat => cat.mother_name === defaultMotherCategory)?.groups.some(g => g.group_name === p.group)));

    let inStockProducts = filtered.filter(p => p.stock > 0);
    const outOfStockProducts = filtered.filter(p => p.stock === 0);

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
  }, [sortBy, currentPage]);

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
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Select value={sortBy} onValueChange={(value) => handleSortChange(value)}>
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

            <div className="grid grid-cols-1">
              <main>
                 <ProductGrid 
                    products={paginatedProducts} 
                    isLoading={false} 
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
