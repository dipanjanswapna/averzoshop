import * as admin from 'firebase-admin';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * এই ফাইলে 'use server' থাকবে না।
 * এটি শুধুমাত্র সার্ভার-সাইড হেল্পার হিসেবে কাজ করবে।
 */
export function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set.");
  }

  let serviceAccount;
  try {
    const rawKey = serviceAccountKey.trim();
    const cleanKey = (rawKey.startsWith("'") && rawKey.endsWith("'")) || 
                     (rawKey.startsWith('"') && rawKey.endsWith('"'))
                     ? JSON.parse(rawKey) : rawKey;
    
    serviceAccount = typeof cleanKey === 'string' ? JSON.parse(cleanKey) : cleanKey;
  } catch (error) {
    throw new Error("Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

// ফাংশন হিসেবে এক্সপোর্ট করা হচ্ছে
export const firestore = () => getFirestore(getFirebaseAdminApp());