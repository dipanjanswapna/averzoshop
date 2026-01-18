
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { updateFcmToken } from '@/actions/user-actions';
import { useToast } from '@/hooks/use-toast';

export const useFcmToken = (userId: string | undefined) => {
  const { toast } = useToast();
  const { firebaseApp } = useFirebase();

  useEffect(() => {
    if (typeof window === 'undefined' || !userId || !firebaseApp) {
      console.log('[FCM] Pre-conditions not met. User ID:', userId, 'Firebase App:', !!firebaseApp);
      return;
    }

    const retrieveToken = async () => {
      try {
        console.log('[FCM] Checking for browser support...');
        const supported = await isSupported();
        if (!supported) {
          console.warn('[FCM] Push notifications are not supported in this browser.');
          return;
        }
        console.log('[FCM] Browser support confirmed.');
        
        const currentPermission = Notification.permission;
        console.log('[FCM] Current notification permission:', currentPermission);

        if (currentPermission === 'granted') {
          console.log('[FCM] Notification permission already granted. Proceeding to get token.');
          
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
            console.log('[FCM] Token generated:', currentToken);
            console.log('[FCM] Saving token to server for user:', userId);
            
            const result = await updateFcmToken(userId, currentToken);
            if (result.success) {
                console.log('[FCM] Token successfully saved to Firestore.');
            } else {
                console.error('[FCM] Failed to save token to Firestore:', result.error);
            }
          } else {
            console.log('[FCM] No registration token available. This can happen if permission was just granted and the service worker is not yet active. Please refresh.');
          }
        } else if (currentPermission === 'default') {
             console.log('[FCM] Notification permission is default. Waiting for user interaction (e.g., bell icon click).');
        } else {
          console.warn('[FCM] Notification permission denied by user.');
        }
      } catch (error) {
        console.error('[FCM] An error occurred while retrieving token:', error);
      }
    };

    retrieveToken();
  }, [userId, firebaseApp, toast]);

  return null; 
};
