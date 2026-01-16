
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
      
      _recalculate: () => {
        const items = get().items;
        const promoCode = get().promoCode;
        const subtotal = calculateSubtotal(items);
        const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 50;
        const isPreOrderCart = items.length > 0 && !!items[0].isPreOrder;
        
        let discount = 0;
        let totalPayable = 0;
        let fullOrderTotal = subtotal;
        let isPartialPayment = false;

        if (isPreOrderCart) {
          // No discounts on pre-orders for simplicity
          let depositTotal = 0;
          items.forEach(item => {
            const preOrderInfo = item.product.preOrder;
            const itemSubtotal = item.variant.price * item.quantity;
            if (preOrderInfo?.enabled && preOrderInfo.depositAmount != null && preOrderInfo.depositAmount > 0) {
              isPartialPayment = true;
              if (preOrderInfo.depositType === 'percentage') {
                depositTotal += (itemSubtotal * preOrderInfo.depositAmount) / 100;
              } else { // fixed
                depositTotal += (preOrderInfo.depositAmount * item.quantity);
              }
            } else {
              depositTotal += itemSubtotal;
            }
          });
          totalPayable = depositTotal + shippingFee; // Add shipping to deposit
        } else {
          discount = calculateDiscount(items, promoCode);
          totalPayable = subtotal - discount + shippingFee;
        }

        set({ subtotal, discount, shippingFee, totalPayable, fullOrderTotal: subtotal, isPartialPayment });
      },

      addItem: (product, variant, quantity = 1) => {
        if (!variant) {
          console.error("addItem was called without a variant for product:", product.name);
          toast({ variant: "destructive", title: "An error occurred", description: "Could not add item to cart." });
          return;
        }
        
        const isPreOrderItem = !!product.preOrder?.enabled;
        const currentItems = get().items;

        if (currentItems.length > 0) {
            const cartIsPreOrder = !!currentItems[0].isPreOrder;
            if (isPreOrderItem !== cartIsPreOrder) {
                toast({
                    variant: 'destructive',
                    title: 'Mixing Items Not Allowed',
                    description: 'Pre-order items and regular items must be purchased in separate orders.',
                });
                return;
            }
        }

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
        set({ items: [], promoCode: null, subtotal: 0, discount: 0, shippingFee: 0, totalPayable: 0, fullOrderTotal: 0, isPartialPayment: false });
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
