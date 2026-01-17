
import type { Address } from './address';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'customer' | 'vendor' | 'rider' | 'admin' | 'outlet';
  status: 'pending' | 'approved' | 'rejected';
  wishlist?: string[];
  addresses?: Address[];
  outletId?: string;
  assignedOutlets?: string[];
  createdAt?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  membershipTier?: 'silver' | 'gold' | 'platinum';
}

    

    