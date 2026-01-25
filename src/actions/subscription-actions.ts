'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

interface SubscriptionResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(email: string): Promise<SubscriptionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  try {
    const db = firestore();
    const subscriptionRef = db.collection('newsletter_subscriptions').doc(email.toLowerCase());
    
    const doc = await subscriptionRef.get();
    if (doc.exists) {
        return { success: true, message: 'You are already subscribed to our newsletter!' };
    }

    await subscriptionRef.set({
      email: email.toLowerCase(),
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Thank you for subscribing to our newsletter!' };
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
