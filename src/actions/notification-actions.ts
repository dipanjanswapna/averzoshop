
'use server';

import * as admin from 'firebase-admin';
import { z } from 'zod';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';

/* ================================
   Zod Schema
================================ */
const SendNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Message is required'),
  link: z.string().url().optional().or(z.literal('')),
});

/* ================================
   Server Action
================================ */
export async function sendNotification(input: unknown) {
  try {
    /* 1️⃣ Validate input */
    const { title, body, link } = SendNotificationSchema.parse(input);

    /* 2️⃣ Ensure Firebase Admin initialized */
    getFirebaseAdminApp();

    /* 3️⃣ Fetch all users FCM tokens */
    const snapshot = await firestore().collection('users').get();

    const tokens: string[] = [];
    const tokenUserMap = new Map<string, string>();

    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = doc.id;
      if (data?.fcmTokens && typeof data.fcmTokens === 'object') {
        const userTokens = Object.keys(data.fcmTokens);
          
        userTokens.forEach((token: string) => {
          if (typeof token === 'string' && token.length > 0) {
            tokens.push(token);
            tokenUserMap.set(token, userId);
          }
        });
      }
    });

    /* 4️⃣ Remove duplicates */
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        message: 'No valid FCM tokens found',
      };
    }

    /* 5️⃣ Chunk (FCM limit = 500) */
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueTokens.length; i += 500) {
      chunks.push(uniqueTokens.slice(i, i + 500));
    }

    let successCount = 0;
    let failureCount = 0;
    
    /* 6️⃣ Send notifications and handle cleanup */
    for (const chunk of chunks) {
      const message: admin.messaging.MulticastMessage = {
        tokens: chunk,
        notification: {
          title,
          body,
        },
        webpush: {
          fcmOptions: {
            link: link || '/',
          },
          notification: {
            icon: '/logo.png',
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      successCount += response.successCount;
      failureCount += response.failureCount;

      const cleanupPromises: Promise<any>[] = [];

      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const errorCode = res.error?.code;

          // Check if the token is invalid and should be removed
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          ) {
            const invalidToken = chunk[idx];
            const userId = tokenUserMap.get(invalidToken);
            console.warn(`[FCM Cleanup] Invalid token detected: ${invalidToken} for user ${userId}. Scheduling for removal.`);
            
            if (userId) {
              const userRef = firestore().collection('users').doc(userId);
              const promise = userRef.update({
                [`fcmTokens.${invalidToken}`]: admin.firestore.FieldValue.delete(),
              });
              cleanupPromises.push(promise);
            }
          } else {
             console.error(`[FCM] Failed to send to token ${chunk[idx]}:`, res.error);
          }
        }
      });
      
      // Wait for all cleanup operations for this chunk to complete
      await Promise.all(cleanupPromises);
    }


    return {
      success: true,
      successCount,
      failureCount,
    };
  } catch (error: any) {
    console.error('[sendNotification error]', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', '),
      };
    }

    return {
      success: false,
      error: error?.message || 'Notification send failed',
    };
  }
}
