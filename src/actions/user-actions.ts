'use server';

import { firestore } from '@/firebase/server';
import * as admin from 'firebase-admin';

/**
 * এই ফাংশনটি ইউজারের FCM Token ডাটাবেসে সেভ বা আপডেট করে।
 * এটি নতুন এবং পুরানো—সব ধরণের ইউজারের জন্য কাজ করবে।
 */
export async function updateFcmToken(userId: string, token: string) {
  // ১. ইনপুট ভ্যালিডেশন
  if (!userId || !token || typeof token !== 'string') {
    return { 
      success: false, 
      error: "Valid User ID and FCM token are required." 
    };
  }
  
  try {
    const userRef = firestore().collection('users').doc(userId);
    
    // ২. প্রথমে চেক করি ডকুমেন্টটি আছে কি না
    const doc = await userRef.get();

    if (!doc.exists) {
      // ৩. যদি ইউজার ডকুমেন্ট না থাকে, তবে নতুন তৈরি করি
      await userRef.set({
        fcmTokens: [token],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } else {
      // ৪. ডকুমেন্ট থাকলে arrayUnion ব্যবহার করি যেন টোকেন ডুপ্লিকেট না হয়
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);

    // ৫. যদি কোনো কারণে আপডেট ফেইল করে (যেমন নেটওয়ার্ক এরর), তবে ব্যাকআপ হিসেবে সেভ ট্রাই করা
    try {
      const userRef = firestore().collection('users').doc(userId);
      await userRef.set({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      return { success: true, error: null };
    } catch (finalError: any) {
      console.error('Final attempt failed:', finalError);
      return { 
        success: false, 
        error: finalError?.message || 'Could not save FCM token to the database.' 
      };
    }
  }
}