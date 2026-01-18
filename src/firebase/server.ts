
import * as admin from 'firebase-admin';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * This file does not have 'use server'.
 * It acts as a server-side helper only.
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
    // Trim and handle if the key is wrapped in single quotes
    const rawKey = serviceAccountKey.trim();
    if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
      serviceAccount = JSON.parse(rawKey.substring(1, rawKey.length - 1));
    } else {
      serviceAccount = JSON.parse(rawKey);
    }
  } catch (error: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
    throw new Error("Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY. Please ensure it's a valid, single-line JSON string.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

// Export as a function
export const firestore = () => getFirestore(getFirebaseAdminApp());
