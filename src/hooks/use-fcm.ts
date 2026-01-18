'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { updateFcmToken } from '@/actions/user-actions';
import { useToast } from '@/hooks/use-toast';

export const useFcmToken = (userId: string | undefined) => {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const { firebaseApp } = useFirebase();

  useEffect(() => {
    if (!userId || !firebaseApp) return;

    const retrieveToken = async () => {
      try {
        console.log('[FCM] Checking for browser support...');
        const supported = await isSupported();
        if (!supported || !('Notification' in window)) {
          console.error('[FCM] Push notifications are not supported in this browser.');
          return;
        }
        console.log('[FCM] Browser support confirmed.');
        
        console.log('[FCM] Requesting notification permission...');
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('[FCM] Notification permission granted.');
          
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.error('[FCM] VAPID key is missing from environment variables.');
            toast({
              variant: 'destructive',
              title: 'Configuration Error',
              description: 'Cannot setup notifications. VAPID key is missing.',
            });
            return;
          }
          console.log('[FCM] VAPID key found. Initializing messaging...');
          
          const messaging = getMessaging(firebaseApp);
          console.log('[FCM] Attempting to get FCM token...');
          const currentToken = await getToken(messaging, { vapidKey });

          if (currentToken) {
            setToken(currentToken);
            console.log('[FCM] Token generated:', currentToken);
            console.log('[FCM] Saving token to server for user:', userId);
            
            const result = await updateFcmToken(userId, currentToken);
            if (result.success) {
                console.log('[FCM] Token successfully saved to Firestore.');
            } else {
                console.error('[FCM] Failed to save token to Firestore:', result.error);
            }
          } else {
            console.log('[FCM] No registration token available. Request permission to generate one.');
          }
        } else {
          console.warn('[FCM] Notification permission denied by user.');
        }
      } catch (error) {
        console.error('[FCM] An error occurred while retrieving token:', error);
      }
    };

    retrieveToken();
  }, [userId, firebaseApp, toast]);

  return token;
};
