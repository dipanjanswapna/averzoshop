'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  const userRef = firestore().collection('users').doc(userId);

  try {
    // Using a map is better for ensuring uniqueness and easier cleanup.
    // The key is the token, the value is true.
    await userRef.set({
      fcmTokens: {
        [token]: true,
      },
    }, { merge: true });
    
    return { success: true };

  } catch (error: any) {
    console.error('FCM Token Update Error:', error);
    return { success: false, error: error.message };
  }
}
