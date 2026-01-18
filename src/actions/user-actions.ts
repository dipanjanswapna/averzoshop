
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
      // Document exists, safely update the array.
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
      });
      console.log(`[Server Action] Token added to existing user's array.`);
    } else {
      // Document does not exist, create it with the token in an array.
      await userRef.set({
        fcmTokens: [token],
      }, { merge: true }); // Use merge:true to avoid overwriting other fields if they are set simultaneously.
      console.log(`[Server Action] New user document created with token.`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
