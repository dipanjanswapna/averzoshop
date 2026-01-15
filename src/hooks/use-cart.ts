
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

        let newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

        if (newQuantity > variant.stock) {
            toast({
                variant: 'destructive',
                title: 'Stock limit reached',
                description: `You can only add up to ${variant.stock} items for this variant.`,
            });
            newQuantity = variant.stock;
        }

        if (existingItem) {
           get().updateQuantity(variant.sku, newQuantity);
        } else {
            set({ items: [...get().items, { product, variant, quantity: newQuantity }] });
        }
        
        toast({
          title: 'Added to cart',
          description: `${product.name} (${variant.size || ''} ${variant.color || ''}) has been added.`,
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
        const itemToUpdate = get().items.find(item => item.variant.sku === variantSku);
        if (!itemToUpdate) return;
        
        if (quantity > itemToUpdate.variant.stock) {
            toast({
                variant: 'destructive',
                title: 'Stock limit reached',
                description: `Only ${itemToUpdate.variant.stock} items available.`,
            });
            quantity = itemToUpdate.variant.stock;
        }

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
