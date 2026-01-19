'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';

// Input Schema
const SendNotificationToRoleInputSchema = z.object({
  role: z.enum(['customer', 'vendor', 'rider', 'admin', 'outlet']),
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  link: z.string().optional(),
});

export type SendNotificationToRoleInput = z.infer<typeof SendNotificationToRoleInputSchema>;

const SendNotificationToRoleOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  totalUsersNotified: z.number(),
});

/**
 * Genkit Flow Definition for sending notification to all users with a specific role
 */
export const sendNotificationToRoleFlow = ai.defineFlow(
  {
    name: 'sendNotificationToRoleFlow',
    inputSchema: SendNotificationToRoleInputSchema,
    outputSchema: SendNotificationToRoleOutputSchema,
  },
  async ({ role, title, body, link }) => {
    getFirebaseAdminApp(); // Ensure Firebase is initialized
    
    const usersSnapshot = await firestore().collection('users').where('role', '==', role).get();
    
    if (usersSnapshot.empty) {
      return { success: false, message: `No users found with role '${role}'.`, totalUsersNotified: 0 };
    }

    const tokens: string[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    const uniqueTokens = [...new Set(tokens)].filter(t => t && typeof t === 'string');

    if (uniqueTokens.length === 0) {
      return { success: false, message: 'No valid FCM tokens found for this role.', totalUsersNotified: 0 };
    }

    // Chunk tokens into groups of 500 (Firebase limit)
    const chunks = [];
    for (let i = 0; i < uniqueTokens.length; i += 500) {
      chunks.push(uniqueTokens.slice(i, i + 500));
    }

    let totalSuccess = 0;
    
    const messagePayload = {
      notification: { title, body },
      webpush: {
        fcmOptions: {
          link: link || '/'
        }
      },
    };

    for (const chunk of chunks) {
        const message = { ...messagePayload, tokens: chunk };
        const response = await admin.messaging().sendEachForMulticast(message);
        totalSuccess += response.successCount;
    }
    
    return {
      success: true,
      message: `Notifications sent to users with role '${role}'.`,
      totalUsersNotified: totalSuccess,
    };
  }
);


export async function sendNotificationToRole(input: SendNotificationToRoleInput) {
  return await sendNotificationToRoleFlow(input);
}
