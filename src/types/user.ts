
import type { Address } from './address';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  coverPhotoURL?: string;
  bio?: string;
  role: 'customer' | 'vendor' | 'rider' | 'admin' | 'outlet' | 'sales' | 'artisan';
  status: 'pending' | 'approved' | 'rejected';
  wishlist?: string[];
  addresses?: Address[];
  outletId?: string;
  assignedOutlets?: string[];
  createdAt?: any;
  loyaltyPoints?: number;
  totalSpent?: number;
  membershipTier?: 'silver' | 'gold' | 'platinum';
  phone?: string;
  fcmTokens?: string[];
  managedBy?: string;
  cardPromoDiscount?: number;
}
