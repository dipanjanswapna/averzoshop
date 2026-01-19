
import * as admin from 'firebase-admin';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
    const rawKey = serviceAccountKey.trim();
    // This handles keys that might be stringified (e.g. from a CI/CD environment)
    const cleanKey = (rawKey.startsWith("'") && rawKey.endsWith("'")) || 
                     (rawKey.startsWith('"') && rawKey.endsWith('"'))
                     ? JSON.parse(rawKey) : rawKey;
    
    serviceAccount = typeof cleanKey === 'string' ? JSON.parse(cleanKey) : cleanKey;
  } catch (error) {
    console.error("Firebase Key Parsing Error:", error);
    throw new Error("Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY. Please ensure it is a valid JSON object or a stringified JSON.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const firestore = () => getFirestore(getFirebaseAdminApp());

    