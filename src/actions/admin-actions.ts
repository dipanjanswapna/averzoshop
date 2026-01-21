'use server';

import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import { revalidatePath } from 'next/cache';

interface AdjustPointsResult {
  success: boolean;
  message: string;
}

export async function adjustUserPoints(userId: string, pointsChange: number, reason: string): Promise<AdjustPointsResult> {
  if (!userId || !reason || pointsChange === 0) {
    return { success: false, message: 'Invalid input provided.' };
  }

  try {
    getFirebaseAdminApp();
    const db = firestore();
    const userRef = db.collection('users').doc(userId);
    const pointsHistoryRef = db.collection('users').doc(userId).collection('points_history').doc();
    
    await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error("User not found.");
        }
        
        // Update loyalty points on user document
        transaction.update(userRef, {
            loyaltyPoints: admin.firestore.FieldValue.increment(pointsChange)
        });

        // Create a record in points history
        transaction.set(pointsHistoryRef, {
            userId: userId,
            pointsChange: pointsChange,
            type: 'adjustment',
            reason: `Admin Adjustment: ${reason}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });

    revalidatePath('/dashboard/users');

    return { success: true, message: 'Points adjusted successfully.' };
  } catch (error: any) {
    console.error("Error adjusting points:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
