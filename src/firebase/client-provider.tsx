
'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider, type FirebaseProviderProps } from './provider';
import { initializeFirebase } from '.';
import { AuthProvider } from '@/hooks/use-auth';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseProviderProps | null>(null);

  useEffect(() => {
    const init = async () => {
      const firebaseInstance = await initializeFirebase();
      setFirebase(firebaseInstance);
    };
    init();
  }, []);

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
