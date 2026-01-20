
import { Timestamp } from "firebase/firestore";

export interface PointTransaction {
  id: string;
  userId: string;
  pointsChange: number;
  type: 'earn' | 'redeem' | 'adjustment';
  reason: string;
  createdAt: Timestamp;
}
