'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  if (!userId || !token) {
    return { success: false, error: "Invalid userId or token provided." };
  }
  
  console.log(`[Server Action] Updating FCM token for user: ${userId}`);

  const userRef = firestore().collection('users').doc(userId);

  try {
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // User doesn't exist, create document with token array.
      await userRef.set({ fcmTokens: [token] }, { merge: true });
      console.log(`[Server Action] New user document created for ${userId}.`);
      return { success: true };
    }

    const userData = userDoc.data();
    // Migration/Cleanup logic: If fcmTokens is a string, convert it to an array.
    if (typeof userData?.fcmTokens === 'string') {
      console.warn(`[Server Action] Migrating fcmTokens from string to array for user ${userId}.`);
      // Overwrite with a new array containing the old and potentially new token.
      const newTokens = Array.from(new Set([userData.fcmTokens, token]));
      await userRef.update({ fcmTokens: newTokens });
    } else {
      // Standard case: Add the new token to the array.
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token)
      });
    }

    console.log(`[Server Action] Token processed for user ${userId}.`);
    return { success: true };

  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    // As a final fallback, try to set the field as an array directly.
    try {
        await userRef.set({ fcmTokens: [token] }, { merge: true });
        console.log('[Server Action] Successfully saved token using fallback set/merge.');
        return { success: true };
    } catch (fallbackError: any) {
        console.error('Error on fallback save for FCM token:', fallbackError);
        return { success: false, error: fallbackError.message || 'An unknown error occurred.' };
    }
  }
}
