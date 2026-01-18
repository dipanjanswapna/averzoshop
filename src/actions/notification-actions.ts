'use server';

import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import { z } from 'zod';

/**
 * ইনপুট ভ্যালিডেশন স্কিমা
 */
const SendNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
  link: z.string().optional().nullable(),
});

/**
 * সরাসরি Firebase Admin SDK ব্যবহার করে নোটিফিকেশন পাঠানোর Server Action।
 */
export async function sendNotification(input: unknown) {
  try {
    // ১. ডাটা ভ্যালিডেশন
    const validatedData = SendNotificationSchema.parse(input);
    const { title, body, link } = validatedData;
    
    // ২. ফায়ারবেস এডমিন ইনিশিয়ালাইজেশন
    getFirebaseAdminApp(); 

    // ৩. Firestore থেকে সব ইউজারের টোকেন সংগ্রহ করা
    const usersSnapshot = await firestore().collection('users').get();
    const tokens: string[] = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    // ৪. ডুপ্লিকেট টোকেন বাদ দেওয়া
    const uniqueTokens = [...new Set(tokens)].filter(t => t && typeof t === 'string');

    if (uniqueTokens.length === 0) {
      return { 
        success: false, 
        successCount: 0, 
        failureCount: 0, 
        error: "কোনো বৈধ FCM টোকেন পাওয়া যায়নি। অন্তত একজনকে লগইন করতে হবে।" 
      };
    }

    // ৫. ৫০০টি করে টোকেন ভাগ করা (FCM Multicast Limit)
    const chunks = [];
    for (let i = 0; i < uniqueTokens.length; i += 500) {
      chunks.push(uniqueTokens.slice(i, i + 500));
    }

    let totalSuccess = 0;
    let totalFailure = 0;

    // ৬. নোটিফিকেশন পাঠানো
    for (const chunk of chunks) {
      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        webpush: {
          fcmOptions: { link: link || '/' },
          notification: { icon: '/logo.png' }
        },
        tokens: chunk,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    }

    return {
      success: true,
      successCount: totalSuccess,
      failureCount: totalFailure,
    };

  } catch (error: any) {
    console.error('Notification Error:', error);
    return { 
      success: false, 
      error: error?.message || "নোটিফিকেশন পাঠানো সম্ভব হয়নি।" 
    };
  }
}