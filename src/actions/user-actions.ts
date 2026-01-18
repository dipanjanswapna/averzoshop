'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

/**
 * ইউজারের FCM Token ডাটাবেসে সেভ বা আপডেট করে।
 */
export async function updateFcmToken(userId: string, token: string) {
  if (!userId || !token) return { success: false, error: "Invalid input" };
  
  try {
    const userRef = firestore().collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        fcmTokens: [token],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } else {
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    return { success: false, error: error.message };
  }
}