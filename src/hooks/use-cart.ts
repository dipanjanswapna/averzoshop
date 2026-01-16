
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
  _recalculate: () => void;
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0);
};

const calculateDiscount = (items: CartItem[], coupon: Coupon | null): number => {
    if (!coupon) return 0;
    
    // Filter cart items that are eligible for the coupon
    const eligibleItems = items.filter(item => {
        if (coupon.creatorType === 'admin') {
            // Admin coupons are applicable to all products unless specified
            return !coupon.applicableProducts || coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(item.product.id);
        }
        if (coupon.creatorType === 'vendor') {
            // Vendor coupons are only applicable to that vendor's products
            if (item.product.vendorId !== coupon.creatorId) {
                return false;
            }
            // If specific products are listed, it must be one of them
            return !coupon.applicableProducts || coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(item.product.id);
        }
        return false;
    });

    if (eligibleItems.length === 0) {
        return 0; // No items in the cart are eligible for this coupon
    }

    const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0);

    if (eligibleSubtotal < coupon.minimumSpend) {
        return 0; // The total of eligible items doesn't meet the minimum spend
    }

    if (coupon.discountType === 'fixed') {
        return Math.min(coupon.value, eligibleSubtotal);
    }
    if (coupon.discountType === 'percentage') {
        return (eligibleSubtotal * coupon.value) / 100;
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
        const discount = calculateDiscount(items, promoCode);
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
