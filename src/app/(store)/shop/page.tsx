
'use client';

import React, { useState, useMemo, useCallback } from 'react';
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

const PRODUCTS_PER_PAGE = 32;

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derive state from URL search params
  const priceRange = useMemo(() => [
    Number(searchParams.get('min_price') || 0),
    Number(searchParams.get('max_price') || 1000)
  ], [searchParams]);
  
  const selectedBrand = useMemo(() => searchParams.get('brand'), [searchParams]);
  const selectedMotherCategory = useMemo(() => searchParams.get('mother_category'), [searchParams]);
  const selectedGroup = useMemo(() => searchParams.get('group'), [searchParams]);
  const selectedSubcategory = useMemo(() => searchParams.get('subcategory'), [searchParams]);
  const sortBy = useMemo(() => searchParams.get('sort_by') || 'newest', [searchParams]);
  const currentPage = useMemo(() => Number(searchParams.get('page') || 1), [searchParams]);

  const handleFilterChange = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 on any filter change
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handlePriceChange = useCallback((newRange: number[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newRange[0] > 0) {
        params.set('min_price', String(newRange[0]));
      } else {
        params.delete('min_price');
      }
      if (newRange[1] < 1000) {
        params.set('max_price', String(newRange[1]));
      } else {
        params.delete('max_price');
      }
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);


  const onPageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    let filtered = [...products];

    // Separate in-stock and out-of-stock products
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
            // Assuming products are already sorted by newest by default in data.ts
            // We can make it more explicit if there's a date field.
            // For now, we will reverse the original array to simulate newest first.
            inStockProducts.reverse();
            break;
    }

    const allSortedProducts = [...inStockProducts, ...outOfStockProducts];
    
    const totalPages = Math.ceil(allSortedProducts.length / PRODUCTS_PER_PAGE);
    
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    
    const paginatedProducts = allSortedProducts.slice(startIndex, endIndex);

    return { paginatedProducts, totalPages };
  }, [selectedBrand, selectedMotherCategory, selectedGroup, selectedSubcategory, priceRange, sortBy, currentPage]);


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
                {selectedMotherCategory && <BreadcrumbSeparator />}
                {selectedMotherCategory && (
                    <BreadcrumbItem>
                        <BreadcrumbPage>{selectedMotherCategory}</BreadcrumbPage>
                    </BreadcrumbItem>
                )}
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
                        <Button variant="outline" className="flex items-center gap-2 lg:hidden">
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

                <Select value={sortBy} onValueChange={(val) => handleFilterChange('sort_by', val)}>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28">
                <FilterSidebar 
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

    
