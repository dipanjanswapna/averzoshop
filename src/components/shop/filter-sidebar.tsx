
'use client';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { products } from '@/lib/data';
import { categoriesData } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';

const brands = [...new Set(products.map(p => p.group))]; // Example brands from product groups

export const FilterSidebar = ({ isLoading }: { isLoading: boolean }) => {
  const [priceRange, setPriceRange] = useState([50, 500]);

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
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-headline font-bold mb-3">Categories</h3>
        <Accordion type="single" collapsible className="w-full">
          {categoriesData.map((category, motherIndex) => (
            <AccordionItem value={`mother-${motherIndex}`} key={motherIndex}>
              <AccordionTrigger className="font-bold text-sm uppercase">
                {category.mother_name}
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="w-full pl-4">
                  {category.groups.map((group, groupIndex) => (
                    <AccordionItem value={`group-${groupIndex}`} key={groupIndex}>
                      <AccordionTrigger className="text-xs font-semibold uppercase">
                        {group.group_name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 pl-4">
                          {group.subs.map((sub, subIndex) => (
                            <li key={subIndex} className="flex items-center space-x-2">
                              <Checkbox id={`${category.mother_name}-${group.group_name}-${sub}`} />
                              <label htmlFor={`${category.mother_name}-${group.group_name}-${sub}`} className="text-xs text-muted-foreground hover:text-primary cursor-pointer">
                                {sub}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-headline font-bold mb-3">Price Range</h3>
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
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-lg font-headline font-bold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox id={`brand-${index}`} />
              <label
                htmlFor={`brand-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
