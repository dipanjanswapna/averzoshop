'use client';
import { getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { app } from './config';

export function initializeFirebase() {
  const firebaseApp: FirebaseApp = !getApps().length
    ? app
    : getApp();
  const auth: Auth = getAuth(firebaseApp);
  const firestore: Firestore = getFirestore(firebaseApp);

  return {
    firebaseApp,
    auth,
    firestore,
  };
}

export * from './provider';
export { FirebaseClientProvider } from './client-provider';
