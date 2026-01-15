
'use client';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { products } from '@/lib/data';
import { categoriesData } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';

const brands = [...new Set(products.map(p => p.group))]; // Example brands from product groups

interface FilterSidebarProps {
  isLoading: boolean;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  selectedBrand: string | null;
  setSelectedBrand: (value: string | null) => void;
  selectedMotherCategory: string | null;
  setSelectedMotherCategory: (value: string | null) => void;
  selectedGroup: string | null;
  setSelectedGroup: (value: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (value: string | null) => void;
}

export const FilterSidebar = ({
  isLoading,
  priceRange,
  setPriceRange,
  selectedBrand,
  setSelectedBrand,
  selectedMotherCategory,
  setSelectedMotherCategory,
  selectedGroup,
  setSelectedGroup,
  selectedSubcategory,
  setSelectedSubcategory,
}: FilterSidebarProps) => {

  const availableGroups = selectedMotherCategory 
    ? categoriesData.find(cat => cat.mother_name === selectedMotherCategory)?.groups || [] 
    : [];

  const availableSubcategories = selectedGroup
    ? availableGroups.find(g => g.group_name === selectedGroup)?.subs || []
    : [];

  const handleMotherCategoryChange = (value: string) => {
    setSelectedMotherCategory(value === 'all' ? null : value);
    setSelectedGroup(null);
    setSelectedSubcategory(null);
  }

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value === 'all' ? null : value);
    setSelectedSubcategory(null);
  }
  
  const handleBrandChange = (value: string) => {
    setSelectedBrand(value === 'all' ? null : value);
  };
  
  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value === 'all' ? null : value);
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
                  {categoriesData.map((category, index) => (
                    <SelectItem key={index} value={category.mother_name}>{category.mother_name}</SelectItem>
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
                  {availableGroups.map((group, index) => (
                     <SelectItem key={index} value={group.group_name}>{group.group_name}</SelectItem>
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
                   {availableSubcategories.map((sub, index) => (
                     <SelectItem key={index} value={sub}>{sub}</SelectItem>
                  ))}
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
                  {brands.map((brand, index) => (
                    <SelectItem key={index} value={brand}>{brand}</SelectItem>
                  ))}
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
                onValueChange={setPriceRange}
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
