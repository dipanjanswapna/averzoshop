
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
    division: string;
    district: string;
    upazila: string;
    area: string;
    streetAddress: string;
}

export type OrderStatus = 'pending_payment' | 'new' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'canceled' | 'pre-ordered' | 'fulfilled';

export interface Order {
    id: string;
    customerId: string;
    shippingAddress?: ShippingAddress;
    items: OrderItem[];
    subtotal?: number;
    cardPromoDiscountAmount?: number;
    discountAmount?: number;
    promoCode?: string | null;
    loyaltyPointsUsed?: number;
    loyaltyDiscount?: number;
    totalAmount: number;
    fullOrderValue?: number;
    assignedOutletId?: string;
    status: OrderStatus;
    orderType: 'regular' | 'pre-order';
    orderMode: 'delivery' | 'pickup';
    pickupOutletId?: string;
    pickupCode?: string;
    createdAt: Timestamp;
    riderId?: string;
    salesRepId?: string;
    paymentStatus?: 'Paid' | 'Unpaid' | 'Failed';
    gatewayTransactionId?: string;
    updatedAt?: any;
}

    