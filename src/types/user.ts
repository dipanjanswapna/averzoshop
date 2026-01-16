
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'customer' | 'vendor' | 'rider' | 'admin' | 'outlet';
  status: 'pending' | 'approved' | 'rejected';
  wishlist?: string[];
  outletId?: string;
  assignedOutlets?: string[];
  createdAt?: string;
  phone?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  membershipTier?: 'silver' | 'gold' | 'platinum';
  isPhoneVerified?: boolean;
}

    
