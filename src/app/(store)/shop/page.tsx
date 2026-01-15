
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProductGrid } from '@/components/shop/product-grid';
import { products } from '@/lib/data';
import { categoriesData } from '@/lib/categories';
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

const PRODUCTS_PER_PAGE = 32;

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
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
    let filtered = [...products];

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
    <div className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>Shop</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Select value={sortBy} onValueChange={(val) => handleSortChange(val)}>
                    <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="newest">Sort by: Newest</SelectItem>
                    <SelectItem value="popularity">Sort by: Popularity</SelectItem>
                    <SelectItem value="price-asc">Sort by: Price Low to High</SelectItem>
                    <SelectItem value="price-desc">Sort by: Price High to Low</SelectItem>
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
  );
}
