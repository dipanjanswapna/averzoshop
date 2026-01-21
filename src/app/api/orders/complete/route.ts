
import { NextResponse, type NextRequest } from 'next/server';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';

async function completeOrder(orderId: string, newStatus: 'delivered' | 'fulfilled') {
  const db = firestore();

  return db.runTransaction(async (transaction) => {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists) throw new Error('Order not found.');
    const order = orderSnap.data() as Order;

    // Prevent re-processing
    if (order.status === 'delivered' || order.status === 'fulfilled' || order.status === 'canceled') {
        return { success: true, message: "Order already processed." };
    }

    const userRef = db.collection('users').doc(order.customerId);
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) throw new Error('Customer not found.');
    const user = userSnap.data() as UserData;

    const settingsRef = db.collection('settings').doc('loyalty');
    const settingsSnap = await transaction.get(settingsRef);
    const settings = settingsSnap.data() || { pointsPer100Taka: 5, pointValueInTaka: 0.20, tierThresholds: { gold: 5000, platinum: 15000 } };

    // Update order status
    transaction.update(orderRef, { status: newStatus, paymentStatus: 'Paid', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    // Update user stats and loyalty points
    let netPointsChange = 0;
    
    // Only award points for COD/unpaid orders. Pre-order points are handled on initial payment.
    if (order.paymentStatus !== 'Paid') {
        const pointsEarned = Math.floor(order.totalAmount / 100) * (settings.pointsPer100Taka || 5);
        if (pointsEarned > 0) {
            netPointsChange += pointsEarned;
            const earnHistoryRef = db.collection(`users/${order.customerId}/points_history`).doc();
            transaction.set(earnHistoryRef, {
                userId: order.customerId,
                pointsChange: pointsEarned,
                type: 'earn',
                reason: `Order: ${orderId}`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    }
    
    const newTotalSpent = (user.totalSpent || 0) + order.totalAmount;
    let newTier = user.membershipTier || 'silver';
    
    const goldThreshold = settings.tierThresholds?.gold ?? 5000;
    const platinumThreshold = settings.tierThresholds?.platinum ?? 15000;

    if (newTotalSpent >= platinumThreshold && newTier !== 'platinum') {
      newTier = 'platinum';
    } else if (newTotalSpent >= goldThreshold && newTier !== 'gold') {
      newTier = 'gold';
    }
    
    let userUpdates: any = {
        totalSpent: admin.firestore.FieldValue.increment(order.totalAmount),
    };
    if (netPointsChange !== 0) {
        userUpdates.loyaltyPoints = admin.firestore.FieldValue.increment(netPointsChange);
    }
    if (newTier !== user.membershipTier) {
        userUpdates.membershipTier = newTier;
    }

    transaction.update(userRef, userUpdates);
    
    return { success: true, message: `Order ${newStatus} and points awarded.` };
  });
}


export async function POST(request: NextRequest) {
  try {
    getFirebaseAdminApp();
    const { orderId, newStatus } = await request.json();

    if (!orderId || !newStatus || (newStatus !== 'delivered' && newStatus !== 'fulfilled')) {
      return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
    }
    
    const result = await completeOrder(orderId, newStatus);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error completing order:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
