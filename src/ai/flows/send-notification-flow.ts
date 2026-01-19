
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';

// Input Schema
const SendNotificationInputSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  link: z.string().nullish().or(z.literal('')),
});

const SendNotificationOutputSchema = z.object({
  successCount: z.number(),
  failureCount: z.number(),
});

/**
 * Genkit Flow Definition
 */
export const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ title, body, link }) => {
    getFirebaseAdminApp(); // Ensure Firebase is initialized
    
    const usersSnapshot = await firestore().collection('users').get();
    const tokens: string[] = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    const uniqueTokens = [...new Set(tokens)].filter(t => t && typeof t === 'string');

    if (uniqueTokens.length === 0) {
      console.warn("No users found with valid FCM tokens.");
      return { successCount: 0, failureCount: 0 };
    }

    // Chunk tokens into groups of 500 (Firebase limit)
    const chunks = [];
    for (let i = 0; i < uniqueTokens.length; i += 500) {
      chunks.push(uniqueTokens.slice(i, i + 500));
    }

    let totalSuccess = 0;
    let totalFailure = 0;

    for (const chunk of chunks) {
        const message = {
          notification: { title, body },
          webpush: {
            fcmOptions: {
              link: link || '/'
            }
          },
          tokens: chunk
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;
    }
    
    return {
      successCount: totalSuccess,
      failureCount: totalFailure,
    };
  }
);

/**
 * Server Action function
 * Call this directly from the dashboard.
 */
export async function sendNotification(input: z.infer<typeof SendNotificationInputSchema>) {
  return await sendNotificationFlow(input);
}

    