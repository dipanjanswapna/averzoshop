'use server';

import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function deleteOutlet(outletId: string): Promise<ActionResult> {
  if (!outletId) {
    return { success: false, message: 'Outlet ID is required.' };
  }

  try {
    getFirebaseAdminApp();
    const db = firestore();
    const batch = db.batch();

    const outletRef = db.collection('outlets').doc(outletId);
    
    // Find and unassign the manager
    const usersRef = db.collection('users');
    const q = usersRef.where('outletId', '==', outletId).limit(1);
    const managerSnapshot = await q.get();
    
    if (!managerSnapshot.empty) {
        const managerDoc = managerSnapshot.docs[0];
        batch.update(managerDoc.ref, { outletId: null });
    }

    // Delete the outlet document
    batch.delete(outletRef);

    await batch.commit();
    
    revalidatePath('/dashboard/outlets');

    return { success: true, message: 'Outlet and manager assignment have been removed.' };
  } catch (error: any) {
    console.error("Error deleting outlet:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

export async function updateOutletStatus(outletId: string, status: 'Active' | 'Inactive'): Promise<ActionResult> {
  if (!outletId) {
    return { success: false, message: 'Outlet ID is required.' };
  }

  try {
    getFirebaseAdminApp();
    const db = firestore();
    const outletRef = db.collection('outlets').doc(outletId);

    await outletRef.update({ status });
    
    revalidatePath('/dashboard/outlets');

    return { success: true, message: `Outlet status has been updated to ${status}.` };
  } catch (error: any) {
    console.error("Error updating outlet status:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
