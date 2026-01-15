
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, Query, query, DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';

interface UseFirestoreQuery<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFirestoreQuery<T>(collectionName: string): UseFirestoreQuery<T> {
  const { firestore } = useFirebase();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) {
      // Firebase might not be initialized yet
      return;
    }

    const q: Query<DocumentData> = query(collection(firestore, collectionName));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ ...doc.data(), id: doc.id } as T);
      });
      setData(documents);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, collectionName]);

  return { data, isLoading, error };
}
