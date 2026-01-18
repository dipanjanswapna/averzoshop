
'use client';

import React, { useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProductGrid } from '@/components/shop/product-grid';
import { categoriesData } from '@/lib/data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';

const PRODUCTS_PER_PAGE = 32;

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: allProducts, isLoading } = useFirestoreQuery<Product>('products');

  const parseQueryParam = (param: string | null, defaultValue: any) => {
    if (!param) return defaultValue;
    try {
      if (param.startsWith('[') && param.endsWith(']')) {
        const parsed = JSON.parse(param);
        if (Array.isArray(parsed) && parsed.length === 2 && typeof parsed[0] === 'number' && typeof parsed[1] === 'number') {
          return parsed;
        }
      }
      return Array.isArray(defaultValue) ? param.split(',') : param;
    } catch (e) {
      return Array.isArray(defaultValue) ? param.split(',') : param;
    }
  };

  const initialFilters = useMemo(() => ({
    page: Number(searchParams.get('page')) || 1,
    sort_by: searchParams.get('sort_by') || 'newest',
    mother_category: searchParams.get('mother_category') || null,
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
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

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
    if (!allProducts) return { paginatedProducts: [], totalPages: 0 };
    let filtered = allProducts.filter(p => p.status === 'approved');

    if (initialFilters.mother_category) {
        filtered = filtered.filter(p => p.category === initialFilters.mother_category || categoriesData.find(c => c.mother_name === initialFilters.mother_category)?.groups.some(g => g.group_name === p.group));
    }
    if (initialFilters.group) {
        filtered = filtered.filter(p => p.group === initialFilters.group);
    }
    if (initialFilters.subcategory) {
        filtered = filtered.filter(p => p.subcategory === initialFilters.subcategory);
    }
    if (initialFilters.brands.length > 0) {
        filtered = filtered.filter(p => initialFilters.brands.includes(p.brand));
    }
    if (initialFilters.colors.length > 0) {
        filtered = filtered.filter(p => p.colors.some(color => initialFilters.colors.includes(color)));
    }
    if (initialFilters.sizes.length > 0) {
        filtered = filtered.filter(p => p.sizes.some(size => initialFilters.sizes.includes(size)));
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
        case 'price-asc':
            inStockProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            inStockProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        default:
            // Assuming createdAt is a string, may need to convert to Date for proper sorting
            inStockProducts.sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
    }

    const allSortedProducts = [...inStockProducts, ...outOfStockProducts];
    const totalPages = Math.ceil(allSortedProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (initialFilters.page - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = allSortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    return { paginatedProducts, totalPages };
  }, [initialFilters, allProducts]);

  const breadcrumbItems = useMemo(() => {
    const items = [
      { name: 'Home', href: '/' },
      { name: 'Shop', href: '/shop' }
    ];
    if (initialFilters.mother_category) {
      items.push({ name: initialFilters.mother_category, href: `/shop?mother_category=${encodeURIComponent(initialFilters.mother_category)}` });
    }
    if (initialFilters.group) {
      items.push({ name: initialFilters.group, href: `/shop?mother_category=${encodeURIComponent(initialFilters.mother_category || '')}&group=${encodeURIComponent(initialFilters.group)}` });
    }
    if (initialFilters.subcategory) {
      items.push({ name: initialFilters.subcategory, href: `/shop?mother_category=${encodeURIComponent(initialFilters.mother_category || '')}&group=${encodeURIComponent(initialFilters.group || '')}&subcategory=${encodeURIComponent(initialFilters.subcategory)}` });
    }
    return items;
  }, [initialFilters.mother_category, initialFilters.group, initialFilters.subcategory]);

  return (
    <div className="bg-secondary">
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.name}>
                    <BreadcrumbItem>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto flex-shrink-0">
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
                      <FilterSidebar
                        categories={categoriesData}
                        onFilterChange={handleFilterChange}
                        initialFilters={initialFilters}
                      />
                    </div>
                </SheetContent>
            </Sheet>
            <Select value={initialFilters.sort_by} onValueChange={(val) => handleSortChange(val)}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
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
              <FilterSidebar
                categories={categoriesData}
                onFilterChange={handleFilterChange}
                initialFilters={initialFilters}
              />
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
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
