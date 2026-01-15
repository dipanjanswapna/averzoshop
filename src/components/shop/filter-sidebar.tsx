
'use client';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import type { categoriesData as CategoriesDataType } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';
import { products } from '@/lib/data';

interface FilterSidebarProps {
  categories: typeof CategoriesDataType;
  priceRange: [number, number];
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
  categories,
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
  }, []);

  const brands = React.useMemo(() => [...new Set(products.map(p => p.group).filter(Boolean))], []);

  const availableGroups = React.useMemo(() => {
    if (!selectedMotherCategory) return [];
    const category = categories.find(cat => cat.mother_name === selectedMotherCategory);
    return category?.groups || [];
  }, [selectedMotherCategory, categories]);

  const availableSubcategories = React.useMemo(() => {
    if (!selectedGroup || !selectedMotherCategory) return [];
    const category = categories.find(cat => cat.mother_name === selectedMotherCategory);
    const group = category?.groups.find(g => g.group_name === selectedGroup);
    return group?.subs || [];
  }, [selectedGroup, selectedMotherCategory, categories]);

  const handleMotherCategoryChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    onMotherCategoryChange(newValue);
    onGroupChange(null);
    onSubcategoryChange(null);
  };

  const handleGroupChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    onGroupChange(newValue);
    onSubcategoryChange(null);
  };

  const handleBrandChange = (value: string) => {
    onBrandChange(value === 'all' ? null : value);
  };

  const handleSubcategoryChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    onSubcategoryChange(newValue);
  };

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
                  {categories.map((category) => (
                    <SelectItem key={category.mother_name} value={category.mother_name}>
                      {category.mother_name}
                    </SelectItem>
                  ))}
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
                  {availableGroups.map((group) => (
                    <SelectItem key={group.group_name} value={group.group_name}>
                      {group.group_name}
                    </SelectItem>
                  ))}
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
                  {availableSubcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger className="text-lg font-headline font-bold">Brand</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Select onValueChange={handleBrandChange} value={selectedBrand || 'all'}>
              <SelectTrigger id="brand-select">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand!}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

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
