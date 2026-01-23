
import { Timestamp } from "firebase/firestore";

export interface GiftCard {
  id: string; // The document ID will be the code
  code: string;
  initialValue: number;
  balance: number;
  recipientEmail?: string;
  senderName?: string;
  message?: string;
  expiryDate: Timestamp;
  createdAt: Timestamp;
  isEnabled: boolean;
}
