'use server';
/**
 * @fileOverview A flow for sending push notifications to all users.
 *
 * - sendNotification - A function to trigger the notification sending process.
 * - SendNotificationInput - The input type for the sendNotification function.
 * - SendNotificationOutput - The return type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import type { UserData } from '@/types/user';

const SendNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main message content of the notification.'),
  link: z.string().optional().describe('The URL to open when the notification is clicked.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

const SendNotificationOutputSchema = z.object({
  successCount: z.number().describe('The number of successfully sent messages.'),
  failureCount: z.number().describe('The number of messages that failed to send.'),
});
export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;

export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationOutput> {
  return sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ title, body, link }) => {
    try {
      getFirebaseAdminApp(); // Ensure admin app is initialized
      const usersSnapshot = await firestore().collection('users').get();
      const allTokens: string[] = [];

      usersSnapshot.forEach(doc => {
        const user = doc.data() as UserData;
        if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
          allTokens.push(...user.fcmTokens);
        }
      });
      
      const uniqueTokens = [...new Set(allTokens)].filter(Boolean);

      if (uniqueTokens.length === 0) {
        return { successCount: 0, failureCount: 0 };
      }
      
      const chunks = [];
      for (let i = 0; i < uniqueTokens.length; i += 500) {
        chunks.push(uniqueTokens.slice(i, i + 500));
      }

      let totalSuccess = 0;
      let totalFailure = 0;

      for (const chunk of chunks) {
          const message = {
            notification: {
              title,
              body,
            },
            webpush: {
              fcmOptions: {
                link: link || process.env.NEXT_PUBLIC_BASE_URL || '/',
              },
            },
            tokens: chunk,
          };
    
          const response = await admin.messaging().sendEachForMulticast(message);
          totalSuccess += response.successCount;
          totalFailure += response.failureCount;
      }
      
      return {
        successCount: totalSuccess,
        failureCount: totalFailure,
      };

    } catch (e: any) {
        console.error("Error sending notifications:", e);
        throw new Error(`Failed to send notifications: ${e.message}`);
    }
  }
);
