'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/types/product';
import { toast } from './use-toast';
import type { Coupon } from '@/types/coupon';

export type CartItem = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  isPreOrder?: boolean;
};

type CartState = {
  items: CartItem[];
  promoCode: Coupon | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalPayable: number;
  fullOrderTotal: number;
  isPartialPayment: boolean;
  regularItemsSubtotal: number;
  preOrderItemsSubtotal: number;
  preOrderDepositPayable: number;
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
    if (!coupon || items.length === 0) return 0;
    
    const eligibleItems = items.filter(item => {
        if (coupon.creatorType === 'admin') {
            return !coupon.applicableProducts || coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(item.product.id);
        }
        if (coupon.creatorType === 'vendor') {
            if (item.product.vendorId !== coupon.creatorId) {
                return false;
            }
            return !coupon.applicableProducts || coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(item.product.id);
        }
        return false;
    });

    if (eligibleItems.length === 0) {
        return 0;
    }

    const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0);

    if (eligibleSubtotal < coupon.minimumSpend) {
        return 0;
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
      shippingFee: 0,
      totalPayable: 0,
      fullOrderTotal: 0,
      isPartialPayment: false,
      regularItemsSubtotal: 0,
      preOrderItemsSubtotal: 0,
      preOrderDepositPayable: 0,
      
      _recalculate: () => {
        const items = get().items;
        const promoCode = get().promoCode;
        
        let regularItemsSubtotal = 0;
        let preOrderItemsSubtotal = 0;
        let preOrderDepositPayable = 0;
        let isPartialPaymentInCart = false;

        items.forEach(item => {
            const itemTotal = (item.variant?.price || 0) * item.quantity;
            if (item.isPreOrder) {
                preOrderItemsSubtotal += itemTotal;
                const preOrderInfo = item.product.preOrder;
                if (preOrderInfo?.enabled && preOrderInfo.depositAmount != null && preOrderInfo.depositAmount > 0) {
                    isPartialPaymentInCart = true;
                    if (preOrderInfo.depositType === 'percentage') {
                        preOrderDepositPayable += (itemTotal * preOrderInfo.depositAmount) / 100;
                    } else { // fixed
                        preOrderDepositPayable += (preOrderInfo.depositAmount * item.quantity);
                    }
                } else {
                    // Pre-order with 100% upfront
                    preOrderDepositPayable += itemTotal;
                }
            } else {
                // Regular item
                regularItemsSubtotal += itemTotal;
            }
        });

        const subtotal = regularItemsSubtotal + preOrderItemsSubtotal;
        const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 50;

        const regularItemsForDiscount = items.filter(item => !item.isPreOrder);
        const discount = calculateDiscount(regularItemsForDiscount, promoCode);
        
        const totalPayable = (regularItemsSubtotal - discount) + preOrderDepositPayable + shippingFee;

        set({
            subtotal,
            discount,
            shippingFee,
            totalPayable,
            fullOrderTotal: subtotal,
            isPartialPayment: isPartialPaymentInCart,
            regularItemsSubtotal,
            preOrderItemsSubtotal,
            preOrderDepositPayable,
        });
      },

      addItem: (product, variant, quantity = 1) => {
        if (!variant) {
          console.error("addItem was called without a variant for product:", product.name);
          toast({ variant: "destructive", title: "An error occurred", description: "Could not add item to cart." });
          return;
        }
        
        const isPreOrderItem = !!product.preOrder?.enabled;
        const currentItems = get().items;

        const existingItem = currentItems.find((item) => item.variant && item.variant.sku === variant.sku);

        let newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        const stock = variant.stock || product.total_stock;
        if (!isPreOrderItem && newQuantity > stock) {
            toast({ variant: 'destructive', title: 'Stock limit reached', description: `Only ${stock} items available.` });
            newQuantity = stock;
        }
        if (newQuantity <= 0) return;

        const newItems = existingItem
            ? currentItems.map(item => item.variant.sku === variant.sku ? { ...item, quantity: newQuantity } : item)
            : [...currentItems, { product, variant, quantity: newQuantity, isPreOrder: isPreOrderItem }];

        set({ items: newItems });
        get()._recalculate();

        toast({
          title: isPreOrderItem ? 'Pre-ordered!' : 'Added to cart',
          description: `${product.name} has been added to your bag.`,
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
        
        const isPreOrderItem = !!itemToUpdate.product.preOrder?.enabled;
        const stock = itemToUpdate.variant.stock || itemToUpdate.product.total_stock;

        if (!isPreOrderItem && quantity > stock) {
            toast({ variant: 'destructive', title: 'Stock limit reached', description: `Only ${stock} items available.`});
            quantity = stock;
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
        set({ 
            items: [], 
            promoCode: null, 
            subtotal: 0, 
            discount: 0, 
            shippingFee: 0, 
            totalPayable: 0, 
            fullOrderTotal: 0, 
            isPartialPayment: false,
            regularItemsSubtotal: 0,
            preOrderItemsSubtotal: 0,
            preOrderDepositPayable: 0,
        });
      },

      applyPromoCode: (coupon) => {
          const items = get().items;
          const regularItemsForDiscount = items.filter(item => !item.isPreOrder);
          
          if (coupon) {
            const discountValue = calculateDiscount(regularItemsForDiscount, coupon);
            if (discountValue === 0 && regularItemsForDiscount.length > 0 && coupon.value > 0) {
                const eligibleSubtotal = regularItemsForDiscount.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0);
                if (coupon.minimumSpend > eligibleSubtotal) {
                    toast({ variant: 'destructive', title: `Minimum spend of ৳${coupon.minimumSpend} required for eligible items.` });
                } else {
                    toast({ variant: 'destructive', title: 'Coupon Not Valid', description: 'This coupon cannot be applied to the regular items in your cart.' });
                }
                set({ promoCode: null });
                get()._recalculate();
                return;
            }
          }
          
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
