'use client';
import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { updateFcmToken } from '@/actions/user-actions';

export const useFcmToken = (userId: string | undefined) => {
  const { firebaseApp } = useFirebase();
  useEffect(() => {
    if (!userId || !firebaseApp) return;

    const requestToken = async () => {
      try {
        const messaging = getMessaging(firebaseApp);
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            // সার্ভার অ্যাকশন কল করে Firestore আপডেট করা
            await updateFcmToken(userId, token);
          }
        }
      } catch (error) {
        console.error('FCM Token Retrieval Error:', error);
      }
    };

    requestToken();
  }, [userId, firebaseApp]);
};
