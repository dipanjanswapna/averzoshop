'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';

// Input Schema
const SendTargetedNotificationInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  link: z.string().optional(),
});

export type SendTargetedNotificationInput = z.infer<typeof SendTargetedNotificationInputSchema>;

const SendTargetedNotificationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  successCount: z.number().optional(),
  failureCount: z.number().optional(),
});

export type SendTargetedNotificationOutput = z.infer<typeof SendTargetedNotificationOutputSchema>;


/**
 * Genkit Flow Definition for sending notification to a specific user
 */
export const sendTargetedNotificationFlow = ai.defineFlow(
  {
    name: 'sendTargetedNotificationFlow',
    inputSchema: SendTargetedNotificationInputSchema,
    outputSchema: SendTargetedNotificationOutputSchema,
  },
  async ({ userId, title, body, link }) => {
    getFirebaseAdminApp(); // Ensure Firebase is initialized
    
    const userDoc = await firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return { success: false, message: 'User not found.' };
    }
    
    const userData = userDoc.data();
    const tokens = userData?.fcmTokens;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return { success: false, message: `No valid FCM tokens found for user ${userId}.` };
    }
    
    const uniqueTokens = [...new Set(tokens)].filter(t => t && typeof t === 'string');

    if (uniqueTokens.length === 0) {
      return { success: false, message: 'No valid FCM tokens found after filtering.' };
    }
    
    const message = {
      notification: { title, body },
      webpush: {
        fcmOptions: {
          link: link || '/'
        }
      },
      tokens: uniqueTokens
    };
    
    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        
        // Cleanup invalid tokens
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success && resp.error) {
                const errorCode = resp.error.code;
                if (errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(uniqueTokens[idx]);
                }
            }
        });
        
        if (tokensToRemove.length > 0) {
            await firestore().collection('users').doc(userId).update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
            });
        }
        
        return {
          success: true,
          message: `Successfully sent notifications.`,
          successCount: response.successCount,
          failureCount: response.failureCount,
        };
    } catch (error: any) {
        console.error('Failed to send notification:', error);
        return { success: false, message: `Failed to send notification: ${error.message}` };
    }
  }
);

/**
 * Server Action function to be called from other server-side code.
 */
export async function sendTargetedNotification(input: SendTargetedNotificationInput) {
  return await sendTargetedNotificationFlow(input);
}
