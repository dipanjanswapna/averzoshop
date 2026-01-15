
'use client';

import React, { useState, useEffect } from 'react';
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

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* --- Top Bar: Breadcrumbs & Sorting --- */}
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
            {/* Mobile Filter Drawer Trigger */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 lg:hidden">
                        <Filter size={16} />
                        <span>Filter</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Filter & Sort</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-80px)] overflow-y-auto p-4 pr-6">
                       <FilterSidebar isLoading={loading} />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <Select defaultValue="newest">
                <SelectTrigger className="w-full md:w-[180px]">
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

      {/* --- Main Content: Sidebar + Product Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* --- Left Sidebar (Desktop) --- */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <FilterSidebar isLoading={loading} />
          </div>
        </aside>

        {/* --- Central Product Grid --- */}
        <main className="lg:col-span-3">
          <ProductGrid products={products} isLoading={loading} />
        </main>
      </div>
    </div>
  );
}
