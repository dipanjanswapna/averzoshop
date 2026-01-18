
'use client';
import { useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { updateFcmToken } from '@/actions/user-actions';
import { useToast } from './use-toast';

export const useFcmToken = (userId: string | undefined) => {
  const { firebaseApp } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined' || !firebaseApp || !userId) {
      return;
    }

    const retrieveToken = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.log('[FCM] Push notifications are not supported in this browser.');
          return;
        }

        if (Notification.permission !== 'granted') {
          console.log('[FCM] Notification permission is not granted yet. Waiting for user action.');
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('[FCM] VAPID key is missing in .env.local');
          toast({
            variant: 'destructive',
            title: 'FCM Config Error',
            description: 'VAPID key for push notifications is not configured.',
          });
          return;
        }
        
        const messaging = getMessaging(firebaseApp);
        console.log('[FCM] Permission granted, attempting to get token...');
        const fcmToken = await getToken(messaging, { vapidKey });

        if (fcmToken) {
          console.log('[FCM] Token received:', fcmToken);
          const result = await updateFcmToken(userId, fcmToken);
          if (result.success) {
            console.log('[FCM] Token successfully synced with the server.');
          } else {
            console.error('[FCM] Failed to save token to server:', result.error);
          }
        } else {
          console.log('[FCM] No registration token available. A page refresh might be needed after granting permission for the first time.');
        }
      } catch (error) {
        console.error('[FCM] An error occurred while retrieving token:', error);
      }
    };
    
    // A small delay can help ensure all services are initialized, especially after a fresh login.
    const timer = setTimeout(() => {
        retrieveToken();
    }, 2000);

    return () => clearTimeout(timer);

  }, [firebaseApp, userId, toast]);

  return null;
};
