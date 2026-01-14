'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '.';
import { onAuthStateChanged } from 'firebase/auth';

export interface FirebaseProviderProps {
  firebaseApp?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

interface FirebaseContextValue extends FirebaseProviderProps {
    user: User | null;
    loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export const useUser = () => {
    const { auth } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!auth) {
        setLoading(false);
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, [auth]);
  
    return { user, loading };
  }

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
    // This part is tricky because useUser needs an auth object.
    // In a real scenario without context, we might not have a user.
    // For now, we return loading true and no user.
    return { firebaseApp, auth, firestore, user: null, loading: true };
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
