
import { Timestamp } from "firebase/firestore";

export interface POSSaleItem {
    productId: string;
    productName: string;
    variantSku: string;
    quantity: number;
    price: number;
}

export interface POSSale {
    id: string;
    outletId: string;
    soldBy: string;
    customerId?: string;
    customerName?: string;
    items: POSSaleItem[];
    subtotal: number;
    cardPromoDiscountAmount?: number;
    discountAmount?: number;
    promoCode?: string | null;
    loyaltyPointsUsed?: number;
    loyaltyDiscount?: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    createdAt: any; // Firestore Timestamp
}

  

    