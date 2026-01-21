'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Search, Layers } from 'lucide-react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce';
import React from 'react';

export function LiveSearch({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  const { data: products, isLoading } = useFirestoreQuery<Product>('products');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setIsOpen(false);
    command();
  }, []);
  
  useEffect(() => {
      if (!isOpen) {
          setQuery('');
      }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery || !products) {
      return [];
    }
    const lowerQuery = debouncedQuery.toLowerCase();
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.brand && product.brand.toLowerCase().includes(lowerQuery)) ||
        product.baseSku.toLowerCase().includes(lowerQuery) ||
        product.variants.some(v => v.sku.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5); // Limit results for performance
  }, [products, debouncedQuery]);

  const categories = useMemo(() => {
    if (!debouncedQuery || !products) return [];
    const lowerQuery = debouncedQuery.toLowerCase();
    const seen = new Set();
    return products
      .map(p => p.category)
      .filter(c => {
        if (!c || !c.toLowerCase().includes(lowerQuery) || seen.has(c)) return false;
        seen.add(c);
        return true;
      })
      .slice(0, 3);
  }, [products, debouncedQuery]);

  const TriggerButton = trigger ? React.cloneElement(trigger as React.ReactElement, { onClick: () => setIsOpen(true) }) : (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-muted-foreground w-full flex items-center justify-between bg-muted border-none rounded-md py-2 px-5 outline-none focus:ring-2 focus:ring-primary h-10"
      >
        <div className="flex items-center gap-2">
            <Search size={18} />
            Search products...
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
  );

  return (
    <>
      {TriggerButton}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Type a product name, sku, brand, or category..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && debouncedQuery && <CommandEmpty>Loading...</CommandEmpty>}
          {!isLoading && debouncedQuery && filteredProducts.length === 0 && categories.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {filteredProducts.length > 0 && (
            <CommandGroup heading="Products">
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => runCommand(() => router.push(`/product/${product.id}`))}
                >
                  <div className="flex items-center gap-3">
                     <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

           {categories.length > 0 && (
                <CommandGroup heading="Categories">
                    {categories.map(category => (
                        <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => runCommand(() => router.push(`/shop?mother_category=${encodeURIComponent(category)}`))}
                        >
                            <Layers className="mr-2 h-4 w-4" />
                            <span>{category}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {debouncedQuery && (
                <CommandItem
                    onSelect={() => runCommand(() => router.push(`/shop?q=${debouncedQuery}`))}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search for "{debouncedQuery}"</span>
                </CommandItem>
            )}

        </CommandList>
      </CommandDialog>
    </>
  );
}
