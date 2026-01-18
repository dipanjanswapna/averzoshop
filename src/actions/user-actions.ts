'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

/**
 * Saves or updates a user's FCM token in Firestore.
 */
export async function updateFcmToken(userId: string, token: string) {
  if (!userId || !token) {
    return { success: false, error: "Invalid userId or token provided." };
  }
  
  console.log(`[Server Action] Updating FCM token for userId: ${userId}`);

  try {
    const userRef = firestore().collection('users').doc(userId);
    const docSnap = await userRef.get();

    if (docSnap.exists()) {
      // Document exists, update it with arrayUnion to prevent duplicates
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[Server Action] Token added to existing user.`);
    } else {
      // Document does not exist, create it with the token
      await userRef.set({
        fcmTokens: [token],
        // You might want to set other default fields here if a user doc could be missing
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`[Server Action] New user document created with token.`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
