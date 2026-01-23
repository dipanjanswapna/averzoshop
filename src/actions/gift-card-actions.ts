
'use server';

import { firestore } from '@/firebase/server';
import { revalidatePath } from 'next/cache';
import * as admin from 'firebase-admin';

interface CreateGiftCardData {
  code?: string;
  value: number;
  expiryDate: Date;
  recipientEmail?: string;
  senderName?: string;
  message?: string;
}

interface CreateGiftCardResult {
    success: boolean;
    message: string;
    code?: string;
}

// Generate a random alphanumeric code
function generateCode(length = 16) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createGiftCard(data: CreateGiftCardData): Promise<CreateGiftCardResult> {
  if (!data.value || data.value <= 0 || !data.expiryDate) {
    return { success: false, message: 'Invalid input provided.' };
  }

  try {
    const db = firestore();
    let code = data.code ? data.code.toUpperCase() : generateCode();

    const giftCardRef = db.collection('gift_cards').doc(code);
    
    // Check if user-provided code already exists
    if (data.code) {
        const doc = await giftCardRef.get();
        if (doc.exists) {
            return { success: false, message: 'This gift card code already exists. Please use a different one.' };
        }
    } else {
        // Ensure auto-generated code is unique
        let doc = await giftCardRef.get();
        while (doc.exists) {
            code = generateCode();
            doc = await db.collection('gift_cards').doc(code).get();
        }
    }

    await giftCardRef.set({
        code,
        initialValue: data.value,
        balance: data.value,
        expiryDate: admin.firestore.Timestamp.fromDate(data.expiryDate),
        isEnabled: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        recipientEmail: data.recipientEmail || null,
        senderName: data.senderName || null,
        message: data.message || null,
    });

    revalidatePath('/dashboard/gift-cards');

    return { success: true, message: 'Gift card created successfully.', code };
  } catch (error: any) {
    console.error("Error creating gift card:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
