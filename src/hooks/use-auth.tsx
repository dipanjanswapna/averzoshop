'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
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
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        if (!firestore) {
            setLoading(false);
            return;
        }
        const userDocRef = doc(firestore, 'users', authUser.uid);
        const unsubSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserData;
            // Ensure both role and status are loaded before setting userData
            if (data.role && data.status) {
              setUserData(data);
            } else {
              setUserData(null);
            }
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setUserData(null);
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

  const value = useMemo(() => ({ user, userData, loading, firestore, auth }), [user, userData, loading, firestore, auth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
