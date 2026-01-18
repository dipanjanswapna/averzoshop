
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

      // Set up foreground message listener
      try {
        const supported = await isSupported();
        if (supported && firebaseInstance.firebaseApp) {
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
        console.error("Error setting up foreground message listener:", error);
      }
    };
    init();
  }, [toast]);

  if (!firebase) {
    // You can return a loading spinner here if you want
    return <>{children}</>;
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
