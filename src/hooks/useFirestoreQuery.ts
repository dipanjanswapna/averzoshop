
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, Query, DocumentData, collection, getFirestore, CollectionReference } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

interface UseFirestoreQuery<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFirestoreQuery<T>(queryString: string): UseFirestoreQuery<T>;
export function useFirestoreQuery<T>(query: Query<DocumentData> | null): UseFirestoreQuery<T>;
export function useFirestoreQuery<T>(q: string | Query<DocumentData> | null): UseFirestoreQuery<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { firestore } = useFirebase();

  const queryObj = useMemo(() => {
    if (typeof q === 'string') {
      if (!firestore) return null;
      return collection(firestore, q) as Query<DocumentData>;
    }
    return q;
  }, [q, firestore]);


  useEffect(() => {
    if (!queryObj) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const unsubscribe = onSnapshot(queryObj, (querySnapshot) => {
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ ...doc.data(), id: doc.id } as T);
      });
      setData(documents);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore query error:", err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [queryObj]);

  return { data, isLoading, error };
}
