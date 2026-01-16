
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
    items: POSSaleItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    createdAt: any; // Firestore Timestamp
}
