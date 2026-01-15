
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

export interface Order {
    id: string;
    customerId: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    totalAmount: number;
    assignedOutletId: string;
    status: 'new' | 'preparing' | 'shipped' | 'delivered' | 'canceled';
    createdAt: Timestamp;
}
