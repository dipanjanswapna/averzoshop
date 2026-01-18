import { Timestamp } from "firebase/firestore";

export interface WishlistItem {
  productId: string;
  addedAt: Timestamp;
  notes?: string;
}

export interface Wishlist {
  id: string;
  name: string;
  isPublic: boolean;
  items: WishlistItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
