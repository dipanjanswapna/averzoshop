
'use client';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { products } from '@/lib/data';
import { categoriesData } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';

const brands = [...new Set(products.map(p => p.group))]; // Example brands from product groups

export const FilterSidebar = ({ isLoading }: { isLoading: boolean }) => {
  const [priceRange, setPriceRange] = useState([50, 500]);
  
  const [selectedMotherCategory, setSelectedMotherCategory] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const availableGroups = selectedMotherCategory 
    ? categoriesData.find(cat => cat.mother_name === selectedMotherCategory)?.groups || [] 
    : [];

  const availableSubcategories = selectedGroup
    ? availableGroups.find(g => g.group_name === selectedGroup)?.subs || []
    : [];

  const handleMotherCategoryChange = (value: string) => {
    setSelectedMotherCategory(value);
    setSelectedGroup(null);
    setSelectedSubcategory(null);
  }

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setSelectedSubcategory(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['category', 'brand', 'price']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg font-headline font-bold">Category</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="mother-category">Mother Category</Label>
              <Select onValueChange={handleMotherCategoryChange}>
                <SelectTrigger id="mother-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData.map((category, index) => (
                    <SelectItem key={index} value={category.mother_name}>{category.mother_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group">Group</Label>
              <Select onValueChange={handleGroupChange} disabled={!selectedMotherCategory}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((group, index) => (
                     <SelectItem key={index} value={group.group_name}>{group.group_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select onValueChange={setSelectedSubcategory} disabled={!selectedGroup}>
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
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
              <Select>
                <SelectTrigger id="brand-select">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
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
                defaultValue={[50]}
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
