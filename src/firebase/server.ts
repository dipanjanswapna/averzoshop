
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

let serviceAccount: admin.ServiceAccount | undefined;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (e: any) {
    console.error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid, single-line JSON string in your .env file.',
      e
    );
  }
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!serviceAccount) {
    throw new Error('Missing or invalid FIREBASE_SERVICE_ACCOUNT_KEY for Firebase Admin SDK');
  }

  return initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = () => getAuth(getFirebaseAdminApp());
export const firestore = () => admin.firestore(getFirebaseAdminApp());
