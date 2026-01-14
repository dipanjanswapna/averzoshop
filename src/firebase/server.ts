
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY for Firebase Admin SDK');
  }

  return initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = () => getAuth(getFirebaseAdminApp());
export const firestore = () => admin.firestore(getFirebaseAdminApp());
