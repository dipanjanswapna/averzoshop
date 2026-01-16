
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/types/product';
import { toast } from './use-toast';
import type { Coupon } from '@/types/coupon';

export type CartItem = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  promoCode: Coupon | null;
  subtotal: number;
  discount: number;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantSku: string) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (coupon: Coupon | null) => void;
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0);
};

const calculateDiscount = (subtotal: number, coupon: Coupon | null): number => {
    if (!coupon || subtotal < coupon.minimumSpend) return 0;
    if (coupon.discountType === 'fixed') {
        return Math.min(coupon.value, subtotal);
    }
    if (coupon.discountType === 'percentage') {
        return (subtotal * coupon.value) / 100;
    }
    return 0;
};


export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      subtotal: 0,
      discount: 0,
      
      _recalculate: () => {
        const items = get().items;
        const promoCode = get().promoCode;
        const subtotal = calculateSubtotal(items);
        const discount = calculateDiscount(subtotal, promoCode);
        set({ subtotal, discount });
      },

      addItem: (product, variant, quantity = 1) => {
        if (!variant) {
          console.error("addItem was called without a variant for product:", product.name);
          toast({ variant: "destructive", title: "An error occurred", description: "Could not add item to cart." });
          return;
        }

        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.variant && item.variant.sku === variant.sku);

        let newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        if (newQuantity > variant.stock) {
            toast({ variant: 'destructive', title: 'Stock limit reached', description: `Only ${variant.stock} items available.` });
            newQuantity = variant.stock;
        }

        const newItems = existingItem
            ? currentItems.map(item => item.variant.sku === variant.sku ? { ...item, quantity: newQuantity } : item)
            : [...currentItems, { product, variant, quantity: newQuantity }];

        set({ items: newItems });
        get()._recalculate();

        toast({
          title: 'Added to cart',
          description: `${product.name} (${variant.size || ''} ${variant.color || ''}) has been added.`,
        });
      },

      removeItem: (variantSku: string) => {
        set({
          items: get().items.filter((item) => item.variant && item.variant.sku !== variantSku),
        });
        get()._recalculate();
        toast({ title: 'Item removed', description: 'The item has been removed from your cart.' });
      },

      updateQuantity: (variantSku, quantity) => {
        const itemToUpdate = get().items.find(item => item.variant && item.variant.sku === variantSku);
        if (!itemToUpdate) return;
        
        if (quantity > itemToUpdate.variant.stock) {
            toast({ variant: 'destructive', title: 'Stock limit reached', description: `Only ${itemToUpdate.variant.stock} items available.`});
            quantity = itemToUpdate.variant.stock;
        }

        if (quantity <= 0) {
          get().removeItem(variantSku);
        } else {
          set({
            items: get().items.map((item) =>
              item.variant && item.variant.sku === variantSku ? { ...item, quantity } : item
            ),
          });
          get()._recalculate();
        }
      },

      clearCart: () => {
        set({ items: [], promoCode: null, subtotal: 0, discount: 0 });
      },

      applyPromoCode: (coupon) => {
          set({ promoCode: coupon });
          get()._recalculate();
      },

    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
