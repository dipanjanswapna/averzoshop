'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  if (!userId || !token) {
    return { success: false, error: "User ID and token are required." };
  }
  
  try {
    const userRef = firestore().collection('users').doc(userId);
    
    // Use arrayUnion to add the token only if it doesn't already exist in the array
    await userRef.update({
      fcmTokens: admin.firestore.FieldValue.arrayUnion(token)
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving FCM token:', error);
    // It's possible the user document doesn't exist yet when this is first called.
    // Let's try to set it with merge if update fails.
    try {
      const userRef = firestore().collection('users').doc(userId);
      await userRef.set({
        fcmTokens: [token]
      }, { merge: true });
      return { success: true, error: null };
    } catch (e) {
        console.error('Error setting FCM token:', e);
        return { success: false, error: 'Could not save FCM token to the database.' };
    }
  }
}
