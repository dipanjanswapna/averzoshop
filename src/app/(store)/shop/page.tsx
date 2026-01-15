
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

const PRODUCTS_PER_PAGE = 32;

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMotherCategory, setSelectedMotherCategory] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  

  const updateStateFromParams = useCallback(() => {
    setPriceRange([Number(searchParams.get('min_price') || 0), Number(searchParams.get('max_price') || 1000)]);
    setSelectedBrand(searchParams.get('brand'));
    setSelectedMotherCategory(searchParams.get('mother_category'));
    setSelectedGroup(searchParams.get('group'));
    setSelectedSubcategory(searchParams.get('subcategory'));
    setSortBy(searchParams.get('sort_by') || 'newest');
    setCurrentPage(Number(searchParams.get('page') || 1));
    setLoading(false);
  }, [searchParams]);

  // Sync state from URL
  useEffect(() => {
    updateStateFromParams();
  }, [searchParams, updateStateFromParams]);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Update URL from state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Helper to set or remove params
    const updateParam = (key: string, value: string | null | undefined) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };
    
    updateParam('brand', selectedBrand);
    updateParam('mother_category', selectedMotherCategory);
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

    // Use router.replace for a smoother experience that doesn't add to browser history
    // only if the query string is different
    if(searchParams.toString() !== params.toString()) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedBrand, selectedMotherCategory, selectedGroup, selectedSubcategory, priceRange, sortBy, currentPage, pathname, router, searchParams]);

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
  );
}
