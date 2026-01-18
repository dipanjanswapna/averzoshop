import * as admin from 'firebase-admin';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * This file acts as a server-side helper only.
 */
export function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in your .env file.");
  }

  let serviceAccount;
  try {
    // The key from .env is a single-line string. It needs to be parsed into a JSON object.
    const sanitizedKey = serviceAccountKey.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(sanitizedKey);
  } catch (error: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
    throw new Error("Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY. Please ensure it's a valid, single-line JSON string.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function firestore() {
  return getFirestore(getFirebaseAdminApp());
}
