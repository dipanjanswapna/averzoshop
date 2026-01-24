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
        if (currentItems.some((item) => item.id === product.id)) {
          toast({
            title: 'Already in Compare',
            description: `${product.name} is already in your compare list.`,
          });
          return false;
        }

        if (currentItems.length >= MAX_COMPARE_ITEMS) {
          toast({
            variant: 'destructive',
            title: 'Compare List Full',
            description: `You can only compare up to ${MAX_COMPARE_ITEMS} items at a time.`,
          });
          return false;
        }

        set({ items: [...currentItems, product] });
        toast({
            title: 'Added to Compare',
            description: `${product.name} has been added to your compare list.`
        });
        return true;
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
        toast({
            title: 'Removed from Compare',
        });
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
