'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  const userRef = firestore().collection('users').doc(userId);

  try {
    const doc = await userRef.get();

    if (!doc.exists()) {
      // If user document doesn't exist, create it with the token in an array.
      await userRef.set({ fcmTokens: [token] }, { merge: true });
    } else {
      const data = doc.data();
      const existingTokens = data?.fcmTokens;

      if (Array.isArray(existingTokens)) {
        // It's already an array, so just add the new token.
        // arrayUnion handles duplicates automatically.
        await userRef.update({
          fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        });
      } else if (typeof existingTokens === 'string') {
        // It's a string, so convert it to an array.
        // This handles migrating old data.
        const newTokens = [...new Set([existingTokens, token])];
        await userRef.update({ fcmTokens: newTokens });
      } else {
        // The field doesn't exist or is a wrong type, so create/overwrite it.
        await userRef.update({ fcmTokens: [token] });
      }
    }
    return { success: true };

  } catch (error: any) {
    console.error('FCM Token Update Error:', error);
    // As a final fallback if update fails for other reasons (e.g. permissions)
    return { success: false, error: error.message };
  }
}
