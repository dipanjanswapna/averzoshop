'use server';

import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  try {
    getFirebaseAdminApp();
    const userRef = firestore().collection('users').doc(userId);

    // Atomically add the new token to the 'fcmTokens' array field.
    // arrayUnion prevents duplicates.
    await userRef.update({
      fcmTokens: admin.firestore.FieldValue.arrayUnion(token)
    });
    
    return { success: true };
  } catch (error: any) {
    // If the document or the fcmTokens field doesn't exist, update fails.
    // We catch this and create the field with the token.
    if (error.code === 5 || error.message.includes('No document to update')) { 
      try {
        await firestore().collection('users').doc(userId).set({
          fcmTokens: [token]
        }, { merge: true });
        return { success: true };
      } catch (setError) {
        console.error('[FCM] Token Set Error:', setError);
        return { success: false, error: (setError as Error).message };
      }
    }
    console.error('[FCM] Token Update Error:', error);
    return { success: false, error: error.message };
  }
}
