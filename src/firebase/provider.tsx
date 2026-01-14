
'use client';

import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '.';
import { AuthProvider } from './auth/use-auth';

export interface FirebaseProviderProps {
  firebaseApp?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

interface FirebaseContextValue extends FirebaseProviderProps {}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export const FirebaseProvider = ({
  children,
  ...props
}: { children: ReactNode } & FirebaseProviderProps) => {
  const contextValue: FirebaseContextValue = { ...props };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <AuthProvider>{children}</AuthProvider>
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    // This can happen on the server or if the provider is not setup.
    // We initialize it here as a fallback.
    const { firebaseApp, auth, firestore } = initializeFirebase();
    return { firebaseApp, auth, firestore };
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp | undefined => {
  return useFirebase()?.firebaseApp;
};

export const useFirestore = (): Firestore | undefined => {
  return useFirebase()?.firestore;
};
