
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

export type OrderStatus = 'new' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'canceled' | 'pre-ordered' | 'fulfilled';

export interface Order {
    id: string;
    customerId: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    subtotal: number;
    discountAmount?: number;
    promoCode?: string;
    totalAmount: number;
    fullOrderValue?: number;
    assignedOutletId: string;
    status: OrderStatus;
    orderType: 'regular' | 'pre-order';
    createdAt: Timestamp;
    riderId?: string;
}

