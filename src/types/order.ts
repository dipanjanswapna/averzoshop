
import { Timestamp } from "firebase/firestore";

export interface OrderItem {
    productId: string;
    productName: string;
    variantSku: string;
    quantity: number;
    price: number;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'canceled';

export interface Order {
    id: string;
    customerId: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    subtotal: number;
    discountAmount?: number;
    promoCode?: string;
    totalAmount: number;
    assignedOutletId: string;
    status: OrderStatus;
    createdAt: Timestamp;
    riderId?: string;
}
