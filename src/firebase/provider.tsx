'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '.';
import { useUser } from './auth/use-user';

export interface FirebaseProviderProps {
  firebaseApp?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

interface FirebaseContextValue extends FirebaseProviderProps {
    user: any;
    loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export const FirebaseProvider = ({
  children,
  ...props
}: { children: ReactNode } & FirebaseProviderProps) => {
  const { user, loading } = useUser();
  const contextValue: FirebaseContextValue = { ...props, user, loading };
  
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    const { user, loading } = useUser();
    return { firebaseApp, auth, firestore, user, loading };
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp | undefined => {
  return useFirebase()?.firebaseApp;
};

export const useAuth = () => {
  return useFirebase();
};

export const useFirestore = (): Firestore | undefined => {
  return useFirebase()?.firestore;
};
