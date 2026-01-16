
export type Coupon = {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minimumSpend: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string; // ISO string
  creatorType: 'admin' | 'vendor';
  creatorId: string;
  applicableProducts?: string[];
};
