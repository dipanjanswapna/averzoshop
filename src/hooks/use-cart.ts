
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/types/product';
import { toast } from './use-toast';

export type CartItem = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantSku: string) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.variant.sku === variant.sku
        );

        if (existingItem) {
           get().updateQuantity(variant.sku, existingItem.quantity + quantity);
        } else {
            set({ items: [...get().items, { product, variant, quantity }] });
        }
        
        toast({
          title: 'Added to cart',
          description: `${product.name} (${variant.sku}) has been added to your cart.`,
        });
      },
      removeItem: (variantSku) => {
        set({
          items: get().items.filter((item) => item.variant.sku !== variantSku),
        });
        toast({
          title: 'Item removed',
          description: 'The item has been removed from your cart.',
        });
      },
      updateQuantity: (variantSku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantSku);
        } else {
          set({
            items: get().items.map((item) =>
              item.variant.sku === variantSku ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
