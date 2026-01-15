
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getFirestore, DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type { UserData } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  firestore: DocumentData | null;
  auth: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  firestore: null,
  auth: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        if (!firestore) {
            setLoading(false);
            return;
        }
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            // Handle case where user exists in Auth but not in Firestore
            setUserData(null);
          }
          setLoading(false);
        });
        return () => unsubSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, firestore, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
