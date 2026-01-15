
'use client';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { products } from '@/lib/data';
import { categoriesData } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  priceRange: number[];
  onPriceChange: (value: number[]) => void;
  selectedBrand: string | null;
  onBrandChange: (value: string | null) => void;
  selectedMotherCategory: string | null;
  onMotherCategoryChange: (value: string | null) => void;
  selectedGroup: string | null;
  onGroupChange: (value: string | null) => void;
  selectedSubcategory: string | null;
  onSubcategoryChange: (value: string | null) => void;
}

export const FilterSidebar = ({
  priceRange,
  onPriceChange,
  selectedBrand,
  onBrandChange,
  selectedMotherCategory,
  onMotherCategoryChange,
  selectedGroup,
  onGroupChange,
  selectedSubcategory,
  onSubcategoryChange,
}: FilterSidebarProps) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, [])

  const brands = React.useMemo(() => [...new Set(products.map(p => p.group))], []);

  const productCounts = React.useMemo(() => {
    const counts = {
      mother: new Map<string, number>(),
      group: new Map<string, number>(),
      sub: new Map<string, number>(),
      brand: new Map<string, number>(),
    };
  
    // Base filtering for counts based on price
    const baseFilteredByPrice = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
  
    // Count brands based only on price filter
    baseFilteredByPrice.forEach(p => {
        if(p.group) counts.brand.set(p.group, (counts.brand.get(p.group) || 0) + 1);
    });
  
    // Determine products filtered by brand (if any)
    const baseFilteredByPriceAndBrand = selectedBrand 
      ? baseFilteredByPrice.filter(p => p.group === selectedBrand)
      : baseFilteredByPrice;
  
    // Count categories, groups, and subs based on price and brand filters
    categoriesData.forEach(cat => {
      let motherCount = 0;
      const motherCategoryProducts = baseFilteredByPriceAndBrand.filter(p => {
        const productCategoryName = p.category === "Men" ? "Men's Fashion" : p.category === "Women" ? "Women's Fashion" : p.category === 'Kids' ? 'Kids & Baby' : p.category;
        return productCategoryName === cat.mother_name || cat.groups.some(g => g.group_name === p.group);
      });
      motherCount = motherCategoryProducts.length;
      counts.mother.set(cat.mother_name, motherCount);
  
      cat.groups.forEach(group => {
        const groupProducts = motherCategoryProducts.filter(p => p.group === group.group_name);
        counts.group.set(group.group_name, groupProducts.length);
        
        group.subs.forEach(sub => {
          const subCount = groupProducts.filter(p => p.subcategory === sub).length;
          counts.sub.set(sub, subCount);
        });
      });
    });
  
    return counts;
  }, [priceRange, selectedBrand]);


  const availableGroups = React.useMemo(() => {
    if (!selectedMotherCategory) return [];
    const category = categoriesData.find(cat => cat.mother_name === selectedMotherCategory);
    return category?.groups || [];
  }, [selectedMotherCategory]);

  const availableSubcategories = React.useMemo(() => {
    if (!selectedGroup || !selectedMotherCategory) return [];
    const category = categoriesData.find(cat => cat.mother_name === selectedMotherCategory);
    const group = category?.groups.find(g => g.group_name === selectedGroup);
    return group?.subs || [];
  }, [selectedGroup, selectedMotherCategory]);


  const handleMotherCategoryChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    onMotherCategoryChange(newValue);
    onGroupChange(null);
    onSubcategoryChange(null);
  }

  const handleGroupChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    onGroupChange(newValue);
    onSubcategoryChange(null);
  }
  
  const handleBrandChange = (value: string) => {
    onBrandChange(value === 'all' ? null : value);
  };
  
  const handleSubcategoryChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    onSubcategoryChange(newValue);
  }


  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-0">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <Accordion type="multiple" defaultValue={['category', 'brand', 'price']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg font-headline font-bold">Category</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="mother-category">Mother Category</Label>
              <Select onValueChange={handleMotherCategoryChange} value={selectedMotherCategory || 'all'}>
                <SelectTrigger id="mother-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesData.map((category, index) => {
                    const count = productCounts.mother.get(category.mother_name) || 0;
                    return (
                      <SelectItem key={index} value={category.mother_name} disabled={count === 0} className={cn(count === 0 && "text-muted-foreground/50")}>
                        <span className="flex justify-between w-full pr-2">
                          <span>{category.mother_name}</span>
                          <span>({count})</span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group">Group</Label>
              <Select onValueChange={handleGroupChange} value={selectedGroup || 'all'} disabled={!selectedMotherCategory}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {availableGroups.map((group, index) => {
                    const count = productCounts.group.get(group.group_name) || 0;
                    return (
                     <SelectItem key={index} value={group.group_name} disabled={count === 0} className={cn(count === 0 && "text-muted-foreground/50")}>
                        <span className="flex justify-between w-full pr-2">
                           <span>{group.group_name}</span>
                           <span>({count})</span>
                        </span>
                     </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select onValueChange={handleSubcategoryChange} value={selectedSubcategory || 'all'} disabled={!selectedGroup}>
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Subcategories</SelectItem>
                   {availableSubcategories.map((sub, index) => {
                    const count = productCounts.sub.get(sub) || 0;
                    return (
                     <SelectItem key={index} value={sub} disabled={count === 0} className={cn(count === 0 && "text-muted-foreground/50")}>
                       <span className="flex justify-between w-full pr-2">
                          <span>{sub}</span>
                          <span>({count})</span>
                        </span>
                     </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-lg font-headline font-bold">Brand</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
              <Select onValueChange={handleBrandChange} value={selectedBrand || 'all'}>
                <SelectTrigger id="brand-select">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand, index) => {
                    const count = productCounts.brand.get(brand) || 0;
                    return (
                    <SelectItem key={index} value={brand} disabled={count === 0} className={cn(count === 0 && "text-muted-foreground/50")}>
                      <span className="flex justify-between w-full pr-2">
                          <span>{brand}</span>
                          <span>({count})</span>
                        </span>
                    </SelectItem>
                  )})}
                </SelectContent>
              </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-headline font-bold">Price Range</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="px-1">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={onPriceChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
