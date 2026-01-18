import * as admin from 'firebase-admin';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Initializes and returns the Firebase Admin App instance.
 * Ensures that the app is initialized only once.
 */
export function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.");
  }

  let serviceAccount;
  try {
    // The key might be a stringified JSON. If so, parse it.
    // This logic handles cases where the env var might have extra quotes.
    const rawKey = serviceAccountKey.trim();
    if (rawKey.startsWith("{") && rawKey.endsWith("}")) {
        serviceAccount = JSON.parse(rawKey);
    } else {
        // If it's not a raw object, it might be a string that needs parsing.
        serviceAccount = JSON.parse(rawKey);
    }
  } catch (error) {
    console.error("Failed to parse Firebase service account key:", error);
    throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON string. Please check its format.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const firestore = () => getFirestore(getFirebaseAdminApp());
export const auth = () => getAuth(getFirebaseAdminApp());
