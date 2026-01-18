'use server';

/**
 * @fileOverview A flow for sending push notifications to all users.
 * Optimized for stability with Genkit and Firebase Admin Multicast limits.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import type { UserData } from '@/types/user';

// ১. ইনপুট স্কিমা (Zod Validation Update)
const SendNotificationInputSchema = z.object({
  title: z.string().min(1).describe('The title of the notification.'),
  body: z.string().min(1).describe('The main message content.'),
  // খালি স্ট্রিং বা স্পেশাল ক্যারেক্টার হ্যান্ডেল করার জন্য আপডেট
  link: z.string().nullish().or(z.literal('')).describe('Optional URL to open.'),
});

export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

// আউটপুট স্কিমা
const SendNotificationOutputSchema = z.object({
  successCount: z.number().describe('Successfully sent messages.'),
  failureCount: z.number().describe('Failed messages.'),
});

export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;

/**
 * ২. সার্ভার অ্যাকশন (Server Action)
 * ai.runFlow ব্যবহার করা হয়েছে যাতে JSON সিরিয়ালাইজেশন এরর না হয়।
 */
export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationOutput> {
  // ডাটা পাঠানোর আগে লিঙ্ক ট্রিম করে নেওয়া হচ্ছে নিরাপত্তার জন্য
  const sanitizedInput = {
    ...input,
    link: input.link ? input.link.trim() : undefined
  };
  return await ai.runFlow(sendNotificationFlow, sanitizedInput);
}

/**
 * ৩. জেনকিট ফ্লো ডেফিনিশন (Genkit Flow Definition)
 */
export const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ title, body, link }) => {
    try {
      getFirebaseAdminApp(); // Firebase Admin নিশ্চিত করা
      
      // Firestore থেকে ইউজারদের ডাটা নিয়ে আসা
      const usersSnapshot = await firestore().collection('users').get();
      const allTokens: string[] = [];

      usersSnapshot.forEach(doc => {
        const user = doc.data() as UserData;
        if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
          allTokens.push(...user.fcmTokens);
        }
      });
      
      // ডুপ্লিকেট এবং ইনভ্যালিড টোকেন রিমুভ করা
      const uniqueTokens = [...new Set(allTokens)].filter(
        token => typeof token === 'string' && token.length > 0
      );

      // যদি কোনো টোকেন না পাওয়া যায়
      if (uniqueTokens.length === 0) {
        return { successCount: 0, failureCount: 0 };
      }
      
      /**
       * ৪. টোকেন চাঙ্কিং (Chunking Logic)
       * Firebase একবারে সর্বোচ্চ ৫০০ টোকেন সাপোর্ট করে।
       */
      const chunks = [];
      for (let i = 0; i < uniqueTokens.length; i += 500) {
        chunks.push(uniqueTokens.slice(i, i + 500));
      }

      let totalSuccess = 0;
      let totalFailure = 0;

      // প্রতিটি গ্রুপে নোটিফিকেশন পাঠানো
      for (const chunk of chunks) {
        const message = {
          notification: {
            title,
            body,
          },
          webpush: {
            fcmOptions: {
              // লিঙ্ক না থাকলে হোমপেজ বা ডিফল্ট URL ব্যবহার হবে
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
        console.error("Critical Error in sendNotificationFlow:", e);
        throw new Error(`Failed to send notifications: ${e.message}`);
    }
  }
);