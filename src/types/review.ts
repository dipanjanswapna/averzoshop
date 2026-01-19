
import { Timestamp } from "firebase/firestore";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  text: string;
  images?: string[];
  createdAt: Timestamp;
  helpful?: number;
  unhelpful?: number;
}
