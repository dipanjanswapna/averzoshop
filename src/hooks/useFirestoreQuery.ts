
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';

interface UseFirestoreQuery<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

// The hook now accepts a Firestore Query object, or null if the query is not ready
export function useFirestoreQuery<T>(q: Query<DocumentData> | null): UseFirestoreQuery<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If the query is not ready (e.g., waiting for user ID), don't fetch.
    if (!q) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [q]); // The dependency on `q` means it MUST be memoized by the caller.

  return { data, isLoading, error };
}
