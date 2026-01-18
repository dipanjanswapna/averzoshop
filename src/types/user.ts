
'use client';
import type { Address } from './address';
import type { Wishlist } from './wishlist';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'customer' | 'vendor' | 'rider' | 'admin' | 'outlet';
  status: 'pending' | 'approved' | 'rejected';
  wishlists?: Wishlist[];
  addresses?: Address[];
  outletId?: string;
  assignedOutlets?: string[];
  createdAt?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  membershipTier?: 'silver' | 'gold' | 'platinum';
  phone?: string;
  fcmTokens?: { [key: string]: boolean; };
}
