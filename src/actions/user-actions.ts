
'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  if (!userId || !token) {
    return { success: false, error: "Invalid userId or token provided." };
  }
  
  console.log(`[Server Action] Updating FCM token for userId: ${userId}`);

  const userRef = firestore().collection('users').doc(userId);

  try {
    const docSnap = await userRef.get();

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Check if fcmTokens exists and is an array. If not, overwrite it.
      if (data && Array.isArray(data.fcmTokens)) {
        await userRef.update({
          fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        });
        console.log(`[Server Action] Token added to existing user's array.`);
      } else {
        // Field is missing or not an array, overwrite it.
        await userRef.update({
          fcmTokens: [token],
        });
        console.log(`[Server Action] fcmTokens field was missing or not an array. Overwriting with new array.`);
      }
    } else {
      // Document does not exist, create it.
      await userRef.set({
        fcmTokens: [token],
      }, { merge: true });
      console.log(`[Server Action] New user document created with token.`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    // If update fails because doc doesn't exist, try setting it. This is a fallback.
    if (error.code === 5) { // Firestore 'NOT_FOUND' error code
        try {
            await userRef.set({ fcmTokens: [token] }, { merge: true });
            console.log(`[Server Action] Fallback: New user document created with token.`);
            return { success: true };
        } catch (set_error: any) {
            console.error('Error setting FCM token after update failed:', set_error);
            return { success: false, error: set_error.message || 'An unknown error occurred during fallback.' };
        }
    }
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
