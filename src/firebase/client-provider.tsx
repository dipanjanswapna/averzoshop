'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider, type FirebaseProviderProps } from './provider';
import { initializeFirebase } from '.';
import { AuthProvider } from '@/hooks/use-auth';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseProviderProps | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const firebaseInstance = await initializeFirebase();
      setFirebase(firebaseInstance);

      try {
        const supported = await isSupported();
        if (supported && firebaseInstance.firebaseApp) {
          console.log('[FCM Provider] FCM is supported, setting up...');
          // 1. Service worker registration
          if ('serviceWorker' in navigator) {
            const firebaseConfig = {
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };
            const swUrl = `/firebase-messaging-sw.js?firebaseConfig=${encodeURIComponent(JSON.stringify(firebaseConfig))}`;
            
            navigator.serviceWorker.register(swUrl)
              .then((registration) => {
                console.log('[FCM Provider] Service worker registered successfully. Scope:', registration.scope);
              })
              .catch((error) => {
                console.error('[FCM Provider] Service worker registration failed:', error);
              });
          }

          // 2. Foreground message listener
          const messaging = getMessaging(firebaseInstance.firebaseApp);
          onMessage(messaging, (payload) => {
            console.log('[FCM Provider] Foreground message received:', payload);
            toast({
              title: payload.notification?.title,
              description: payload.notification?.body,
            });
          });
        } else {
           console.log('[FCM Provider] FCM is not supported in this browser.');
        }
      } catch (error) {
        console.error("[FCM Provider] Error during FCM setup:", error);
      }
    };
    init();
  }, [toast]);

  if (!firebase) return <>{children}</>;

  return (
    <FirebaseProvider
      firebaseApp={firebase.firebaseApp}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}
