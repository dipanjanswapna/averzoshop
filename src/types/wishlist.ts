
import { Timestamp } from "firebase/firestore";

export interface WishlistItem {
  productId: string;
  addedAt: Timestamp;
  notes?: string;
  quantity: number;
}

export interface Wishlist {
  id: string;
  name: string;
  isPublic: boolean;
  isDefault?: boolean;
  items: WishlistItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
