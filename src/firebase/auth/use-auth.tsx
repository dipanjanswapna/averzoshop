
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../provider';
import type { UserData } from '@/types/user';


interface AuthContextValue {
  auth?: Auth;
  firestore?: Firestore;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userData: null,
  loading: true,
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

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Set cookie for server-side rendering
        const token = await getIdToken(user);
        document.cookie = `firebaseIdToken=${token}; path=/;`;
      } else {
        // Clear cookie on sign out
        document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);


  useEffect(() => {
    if (!firestore || !user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            setUserData(doc.data() as UserData);
        } else {
            setUserData(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching user data:", error);
        setUserData(null);
        setLoading(false);
    });

    return () => unsubscribeFirestore();

  }, [firestore, user]);


  const value = { auth, firestore, user, userData, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
