
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/types/product';
import { toast } from './use-toast';

type CompareState = {
  items: Product[];
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  clearCompare: () => void;
};

const MAX_COMPARE_ITEMS = 4;

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        if (currentItems.length >= MAX_COMPARE_ITEMS) {
          toast({
            variant: 'destructive',
            title: 'Compare List Full',
            description: `You can only compare up to ${MAX_COMPARE_ITEMS} items at a time.`,
          });
          return false;
        }
        if (currentItems.some((item) => item.id === product.id)) {
            toast({
                title: 'Already in Compare',
                description: `${product.name} is already in your compare list.`,
            });
            return false;
        }
        
        // Check for category compatibility
        if (currentItems.length > 0 && currentItems[0].category !== product.category) {
            toast({
                variant: 'destructive',
                title: 'Category Mismatch',
                description: `You can only compare items within the same category. Current category: ${currentItems[0].category}.`,
            });
            return false;
        }

        set({ items: [...currentItems, product] });
        return true;
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      clearCompare: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'compare-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

    