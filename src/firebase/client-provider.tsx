'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider, type FirebaseProviderProps } from './provider';
import { initializeFirebase } from '.';
import { AuthProvider } from '@/hooks/use-auth';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseProviderProps | null>(null);
  const [initializing, setInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      try {
        const firebaseInstance = await initializeFirebase();
        setFirebase(firebaseInstance);

        const supported = await isSupported();
        if (supported && firebaseInstance.firebaseApp) {
          if ('serviceWorker' in navigator) {
            const firebaseConfig = {
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };
            const url = `/firebase-messaging-sw.js?firebaseConfig=${encodeURIComponent(JSON.stringify(firebaseConfig))}`;
            navigator.serviceWorker.register(url)
              .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
              }).catch((error) => {
                console.error('Service Worker registration failed:', error);
              });
          }

          const messaging = getMessaging(firebaseInstance.firebaseApp);
          onMessage(messaging, (payload) => {
            console.log('Foreground message received. ', payload);
            toast({
              title: payload.notification?.title,
              description: payload.notification?.body,
            });
          });
        }
      } catch (error) {
        console.error("Error setting up Firebase services:", error);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [toast]);

  if (initializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="lds-ring">
            <div />
            <div />
            <div />
            <div />
          </div>
          <AverzoLogo className="text-2xl" />
          <p className="text-muted-foreground animate-pulse">Loading Averzo...</p>
        </div>
      </div>
    );
  }

  if (!firebase) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-destructive">Initialization Failed</h1>
                <p className="text-muted-foreground">Could not connect to services. Please refresh the page.</p>
            </div>
        </div>
    )
  }

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
