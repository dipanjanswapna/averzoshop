"use client";

import React, { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { products, categoriesData as categoriesDataType } from '@/lib/data';

type Product = typeof products[0];
type CategoriesData = typeof categoriesDataType;

interface FilterSidebarProps {
  categories: CategoriesData;
  products: Product[];
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

export function FilterSidebar({ categories, products, onFilterChange, initialFilters }: FilterSidebarProps) {
  
  const [motherCategory, setMotherCategory] = useState(initialFilters.mother_category || '');
  const [group, setGroup] = useState(initialFilters.group || '');
  const [subcategory, setSubcategory] = useState(initialFilters.subcategory || '');
  const [priceRange, setPriceRange] = useState(initialFilters.price_range || [0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters.brands || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialFilters.colors || []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialFilters.sizes || []);
  const [selectedDiscount, setSelectedDiscount] = useState(initialFilters.discount || '');
  const [isBundle, setIsBundle] = useState(initialFilters.is_bundle || false);

  const availableGroups = useMemo(() => {
    if (!motherCategory) return [];
    const cat = categories.find(c => c.mother_name === motherCategory);
    return cat ? cat.groups : [];
  }, [motherCategory, categories]);

  const availableSubcategories = useMemo(() => {
    if (!group) return [];
    const cat = categories.find(c => c.mother_name === motherCategory);
    const grp = cat?.groups.find(g => g.group_name === group);
    return grp ? grp.subs : [];
  }, [group, motherCategory, categories]);


  const applyFilters = () => {
    onFilterChange({
      mother_category: motherCategory || null,
      group: group || null,
      subcategory: subcategory || null,
      price_range: priceRange,
      brands: selectedBrands.length > 0 ? selectedBrands : null,
      colors: selectedColors.length > 0 ? selectedColors : null,
      sizes: selectedSizes.length > 0 ? selectedSizes : null,
      discount: selectedDiscount || null,
      is_bundle: isBundle || null,
      page: 1, // Reset page on filter change
    });
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };
  
  const handleColorChange = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };
  
  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-headline">Filters</h3>
        <Button onClick={applyFilters}>Apply</Button>
      </div>

      <Accordion type="multiple" defaultValue={['category', 'price', 'brand']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg font-semibold">Category</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mother Category</label>
              <select 
                value={motherCategory} 
                onChange={e => { setMotherCategory(e.target.value); setGroup(''); setSubcategory(''); }}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.mother_name} value={cat.mother_name}>{cat.mother_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group</label>
              <select 
                value={group} 
                onChange={e => { setGroup(e.target.value); setSubcategory(''); }}
                disabled={!motherCategory}
                className="w-full p-2 border rounded-md text-sm disabled:bg-gray-100"
              >
                <option value="">All Groups</option>
                {availableGroups.map(grp => <option key={grp.group_name} value={grp.group_name}>{grp.group_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategory</label>
              <select 
                value={subcategory} 
                onChange={e => setSubcategory(e.target.value)}
                disabled={!group}
                className="w-full p-2 border rounded-md text-sm disabled:bg-gray-100"
              >
                <option value="">All Subcategories</option>
                {availableSubcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-semibold">Price</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2000}
              step={10}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-lg font-semibold">Brand</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-2">
            {ALL_BRANDS.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)} />
                <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        
        {/* Color Filter */}
        <AccordionItem value="color">
          <AccordionTrigger className="text-lg font-semibold">Color</AccordionTrigger>
          <AccordionContent className="pt-4 flex flex-wrap gap-3">
            {ALL_COLORS.map(color => (
                 <button key={color} onClick={() => handleColorChange(color)} className={`h-8 w-8 rounded-full border-2 ${selectedColors.includes(color) ? 'border-primary' : 'border-transparent'}`} style={{backgroundColor: color.toLowerCase()}} title={color} />
            ))}
          </AccordionContent>
        </AccordionItem>

         {/* Size Filter */}
        <AccordionItem value="size">
          <AccordionTrigger className="text-lg font-semibold">Size</AccordionTrigger>
          <AccordionContent className="pt-4 flex flex-wrap gap-2">
            {ALL_SIZES.map(size => (
              <button key={size} onClick={() => handleSizeChange(size)} className={`h-10 w-12 border rounded-md text-sm font-medium ${selectedSizes.includes(size) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {size}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Discount Filter */}
        <AccordionItem value="discount">
          <AccordionTrigger className="text-lg font-semibold">Discount Range</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-2">
             {DISCOUNT_RANGES.map(range => (
              <div key={range.value} className="flex items-center space-x-2">
                <Checkbox id={`discount-${range.value}`} checked={selectedDiscount === range.value} onCheckedChange={() => setSelectedDiscount(prev => prev === range.value ? '' : range.value)} />
                <label htmlFor={`discount-${range.value}`} className="text-sm">{range.label}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Bundles Filter */}
        <AccordionItem value="bundles">
          <AccordionTrigger className="text-lg font-semibold">Offers</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="bundle-offer" checked={isBundle} onCheckedChange={(checked) => setIsBundle(!!checked)} />
                <label htmlFor="bundle-offer" className="text-sm">Bundle Offers</label>
              </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
