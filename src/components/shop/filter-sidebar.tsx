
"use client";

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { categoriesData } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSidebarProps {
  categories: typeof categoriesData;
  onFilterChange: (filters: Record<string, any>) => void;
  initialFilters: Record<string, any>;
}

const ALL_BRANDS = ["Nike", "Adidas", "Puma", "Levi's", "Zara", "H&M"];
const ALL_COLORS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink"];
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];
const DISCOUNT_RANGES = [
  { label: '10% & Above', value: '10' },
  { label: '20% & Above', value: '20' },
  { label: '30% & Above', value: '30' },
  { label: '40% & Above', value: '40' },
  { label: '50% & Above', value: '50' },
];

export function FilterSidebar({ categories, onFilterChange, initialFilters }: FilterSidebarProps) {
  
  const { 
    mother_category, 
    group, 
    subcategory,
    price_range = [0, 5000],
    brands = [],
    colors = [],
    sizes = [],
    discount,
    is_bundle = false,
  } = initialFilters;

  const [minPrice, setMinPrice] = useState(price_range[0]);
  const [maxPrice, setMaxPrice] = useState(price_range[1]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (minPrice !== price_range[0] || maxPrice !== price_range[1]) {
        handleFilterUpdate('price_range', [minPrice, maxPrice]);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [minPrice, maxPrice]);
  
  useEffect(() => {
    setMinPrice(price_range[0]);
    setMaxPrice(price_range[1]);
  }, [price_range]);

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...initialFilters, [key]: value, page: 1 };
    
    if (key === 'mother_category') {
      newFilters.group = null;
      newFilters.subcategory = null;
    }
    if (key === 'group') {
      newFilters.subcategory = null;
    }
    
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k] === null || newFilters[k] === undefined || (Array.isArray(newFilters[k]) && newFilters[k].length === 0)) {
        if(k !== 'is_bundle' && k !== 'price_range' ) {
            delete newFilters[k];
        }
      }
    });

    onFilterChange(newFilters);
  };
  
  const handleMultipleSelect = (key: 'brands' | 'colors' | 'sizes', value: string) => {
    const currentValues = initialFilters[key] || [];
    const newValues = currentValues.includes(value) 
      ? currentValues.filter((v: string) => v !== value) 
      : [...currentValues, value];
    handleFilterUpdate(key, newValues);
  };

  const availableGroups = React.useMemo(() => {
    if (!mother_category) return [];
    const cat = categories.find(c => c.mother_name === mother_category);
    return cat ? cat.groups : [];
  }, [mother_category, categories]);

  const availableSubcategories = React.useMemo(() => {
    if (!group) return [];
    const cat = categories.find(c => c.mother_name === mother_category);
    const grp = cat?.groups.find(g => g.group_name === group);
    return grp ? grp.subs : [];
  }, [group, mother_category, categories]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-headline">Filters</h3>

      <Accordion type="multiple" defaultValue={['category', 'price', 'brand', 'color', 'size', 'discount', 'bundles']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg font-semibold">Category</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mother Category</label>
               <Select onValueChange={(value) => handleFilterUpdate('mother_category', value === 'all' ? null : value)} value={mother_category || 'all'}>
                    <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => <SelectItem key={cat.mother_name} value={cat.mother_name}>{cat.mother_name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group</label>
               <Select onValueChange={(value) => handleFilterUpdate('group', value === 'all' ? null : value)} value={group || 'all'} disabled={!mother_category}>
                    <SelectTrigger><SelectValue placeholder="All Groups" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {availableGroups.map(grp => <SelectItem key={grp.group_name} value={grp.group_name}>{grp.group_name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategory</label>
              <Select onValueChange={(value) => handleFilterUpdate('subcategory', value === 'all' ? null : value)} value={subcategory || 'all'} disabled={!group}>
                  <SelectTrigger><SelectValue placeholder="All Subcategories" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {availableSubcategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-semibold">Price</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
             <div className="flex items-center gap-4">
                <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                    <Input 
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="pl-7"
                    />
                </div>
                 <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                    <Input 
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="pl-7"
                    />
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger className="text-lg font-semibold">Brand</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-2">
            {ALL_BRANDS.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand}`} checked={brands.includes(brand)} onCheckedChange={() => handleMultipleSelect('brands', brand)} />
                <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="color">
          <AccordionTrigger className="text-lg font-semibold">Color</AccordionTrigger>
          <AccordionContent className="pt-4 flex flex-wrap gap-3">
            {ALL_COLORS.map(color => (
                 <button key={color} onClick={() => handleMultipleSelect('colors', color)} className={`h-8 w-8 rounded-full border-2 ${colors.includes(color) ? 'border-primary ring-2 ring-primary/50' : 'border-border'}`} style={{backgroundColor: color.toLowerCase()}} title={color} />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger className="text-lg font-semibold">Size</AccordionTrigger>
          <AccordionContent className="pt-4 flex flex-wrap gap-2">
            {ALL_SIZES.map(size => (
              <button key={size} onClick={() => handleMultipleSelect('sizes', size)} className={`h-10 w-12 border rounded-md text-sm font-medium ${sizes.includes(size) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {size}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="discount">
          <AccordionTrigger className="text-lg font-semibold">Discount Range</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-2">
             {DISCOUNT_RANGES.map(range => (
              <div key={range.value} className="flex items-center space-x-2">
                <Checkbox id={`discount-${range.value}`} checked={discount === range.value} onCheckedChange={() => handleFilterUpdate('discount', discount === range.value ? null : range.value)} />
                <label htmlFor={`discount-${range.value}`} className="text-sm">{range.label}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bundles">
          <AccordionTrigger className="text-lg font-semibold">Offers</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="bundle-offer" checked={is_bundle} onCheckedChange={(checked) => handleFilterUpdate('is_bundle', !!checked)} />
                <label htmlFor="bundle-offer" className="text-sm">Bundle Offers</label>
              </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
