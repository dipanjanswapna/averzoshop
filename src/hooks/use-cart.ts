
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { products } from '@/lib/data';
import { toast } from './use-toast';

type Product = (typeof products)[0];

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
           get().updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            set({ items: [...get().items, { product, quantity: 1 }] });
        }
        
        toast({
          title: 'Added to cart',
          description: `${product.name} has been added to your cart.`,
        });
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
        toast({
          title: 'Item removed',
          description: 'The item has been removed from your cart.',
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
        } else {
          set({
            items: get().items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
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
