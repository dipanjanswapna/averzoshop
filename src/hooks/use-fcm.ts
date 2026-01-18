'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase'; // Using the central provider
import { updateFcmToken } from '@/actions/user-actions';
import { useToast } from './use-toast';

export const useFcmToken = (userId: string | undefined) => {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const { firebaseApp } = useFirebase(); // Get app instance from provider

  useEffect(() => {
    if (!userId || !firebaseApp) return;

    const retrieveToken = async () => {
      console.log('FCM Hook: Checking notification support...');
      const supported = await isSupported();
      if (!supported) {
        console.error('FCM Hook: Firebase Messaging is not supported in this browser.');
        return;
      }

      console.log('FCM Hook: Requesting notification permission...');
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('FCM Hook: Notification permission granted.');
        try {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.error('FCM Hook: VAPID key is not set in environment variables.');
            toast({
              variant: 'destructive',
              title: 'Configuration Error',
              description: 'Cannot setup notifications. VAPID key is missing.',
            });
            return;
          }
          
          console.log('FCM Hook: VAPID key found. Attempting to get token...');
          const messaging = getMessaging(firebaseApp);
          const currentToken = await getToken(messaging, { vapidKey });

          if (currentToken) {
            setToken(currentToken);
            console.log('FCM Hook: Token generated:', currentToken);
            
            console.log('FCM Hook: Attempting to save token to server for user:', userId);
            const result = await updateFcmToken(userId, currentToken);
            
            if (result.success) {
                console.log('FCM Hook: Token successfully saved to Firestore.');
            } else {
                console.error('FCM Hook: Failed to save token to Firestore.', result.error);
            }
          } else {
            console.log('FCM Hook: No registration token available. Request permission to generate one.');
          }
        } catch (error) {
          console.error('FCM Hook: An error occurred while retrieving token.', error);
          toast({
              variant: 'destructive',
              title: 'Notification Error',
              description: 'Could not retrieve notification token.',
          });
        }
      } else {
        console.log('FCM Hook: Notification permission denied.');
      }
    };

    retrieveToken();
  }, [userId, firebaseApp, toast]);

  return token;
};
