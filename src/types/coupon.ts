import { Timestamp } from "firebase/firestore";

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minimumSpend: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: Timestamp;
  creatorType: 'admin' | 'vendor';
  creatorId: string;
  applicableProducts?: string[];
  createdAt: Timestamp;
};
