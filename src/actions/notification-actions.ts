'use server';

import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import { z } from 'zod';

const SendNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
  link: z.string().optional().nullable(),
});

export async function sendNotification(input: unknown) {
  try {
    // 1. Validate input data
    const validatedData = SendNotificationSchema.parse(input);
    const { title, body, link } = validatedData;
    
    // 2. Initialize Firebase Admin
    getFirebaseAdminApp(); 

    // 3. Fetch all user tokens from Firestore
    const usersSnapshot = await firestore().collection('users').get();
    const tokens: string[] = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    // 4. Filter out duplicate or invalid tokens
    const uniqueTokens = [...new Set(tokens)].filter(t => t && typeof t === 'string');

    if (uniqueTokens.length === 0) {
      return { 
        success: false, 
        successCount: 0, 
        failureCount: 0, 
        error: "No valid FCM tokens found in the database. Please ensure users have granted notification permissions." 
      };
    }

    // 5. Chunk tokens into groups of 500 (FCM multicast limit)
    const chunks = [];
    for (let i = 0; i < uniqueTokens.length; i += 500) {
      chunks.push(uniqueTokens.slice(i, i + 500));
    }

    let totalSuccess = 0;
    let totalFailure = 0;
    const errors: any[] = [];

    // 6. Send notifications in chunks
    for (const chunk of chunks) {
      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        webpush: {
          fcmOptions: { link: link || '/' },
          notification: { icon: '/logo.png' } // Assuming you have a logo here
        },
        tokens: chunk,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
      
      response.responses.forEach(resp => {
        if (!resp.success) {
          errors.push(resp.error?.message);
        }
      });
    }

    console.log(`Notifications Sent: ${totalSuccess} success, ${totalFailure} failures.`);
    if (totalFailure > 0) {
        console.error("FCM Send Errors:", errors);
    }

    return {
      success: true,
      successCount: totalSuccess,
      failureCount: totalFailure,
    };

  } catch (error: any) {
    console.error('sendNotification action failed:', error);
    let errorMessage = "Failed to send notifications.";
    if (error instanceof z.ZodError) {
        errorMessage = error.errors.map(e => e.message).join(' ');
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { 
      success: false, 
      error: errorMessage,
    };
  }
}
