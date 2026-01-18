
'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

export async function updateFcmToken(userId: string, token: string) {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    // If the document doesn't exist, create it with the token map.
    if (!userDoc.exists) {
      await userRef.set({
        fcmTokens: {
          [token]: true,
        },
      }, { merge: true });
      return { success: true };
    }

    // If doc exists, update it. This handles both string-to-map conversion and adding a new token.
    await userRef.update({
      [`fcmTokens.${token}`]: true,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('FCM Token Update Error:', error);
    // This is a fallback in case the initial `update` fails on a non-existent document
    // for some reason, though the initial check should prevent it.
    if (error.code === 5) {
       try {
        await firestore().collection('users').doc(userId).set({
          fcmTokens: { [token]: true }
        }, { merge: true });
        return { success: true };
      } catch (setError) {
        console.error('[FCM] Token Set Error on Fallback:', setError);
        return { success: false, error: (setError as Error).message };
      }
    }
    return { success: false, error: error.message };
  }
}
