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
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce';

export function LiveSearch() {
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

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery || !products) {
      return [];
    }
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
        product.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      .slice(0, 5); // Limit results for performance
  }, [products, debouncedQuery]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-muted-foreground w-full flex items-center justify-between bg-muted border-none rounded-md py-2 px-5 outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center gap-2">
            <Search size={18} />
            Search products...
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Type a product name, brand, or category..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && debouncedQuery && <CommandEmpty>Loading products...</CommandEmpty>}
          {!isLoading && filteredProducts.length === 0 && debouncedQuery && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {filteredProducts.length > 0 && (
            <CommandGroup heading="Products">
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    runCommand(() => router.push(`/product/${product.id}`));
                  }}
                >
                  <div className="flex items-center gap-3">
                     <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">in {product.category}</p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
