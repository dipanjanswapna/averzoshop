'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase'; // আপনার index.ts থেকে লোড হবে
import { updateFcmToken } from '@/actions/user-actions';

export const useFcmToken = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const requestToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // Firebase ক্লায়েন্ট ইনিশিয়ালাইজেশন
          const { firebaseApp } = initializeFirebase();
          const messaging = getMessaging(firebaseApp);
          
          const permission = await Notification.requestPermission();
          
          if (permission === 'granted') {
            const token = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            if (token) {
              // সার্ভার অ্যাকশন কল করে টোকেন সেভ করা
              await updateFcmToken(userId, token);
            }
          }
        }
      } catch (error) {
        console.error('FCM Registration Error:', error);
      }
    };

    requestToken();
  }, [userId]);
};