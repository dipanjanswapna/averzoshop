

import { NextResponse, type NextRequest } from 'next/server';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';
import { sendTargetedNotification } from '@/ai/flows/send-targeted-notification';

interface LoyaltySettingsData {
    pointsPer100Taka: { silver: number; gold: number; platinum: number; };
    tierThresholds: { gold: number; platinum: number; };
}

async function completeOrder(orderId: string, newStatus: 'delivered' | 'fulfilled') {
  const db = firestore();
  
  let tierUpdateInfo = { tierUpdated: false, newTier: '', userId: '' };

  const transactionResult = await db.runTransaction(async (transaction) => {
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
    if (!settingsSnap.exists) throw new Error("Loyalty settings not configured.");
    const loyaltySettings = settingsSnap.data() as LoyaltySettingsData;

    // Update order status
    transaction.update(orderRef, { status: newStatus, paymentStatus: 'Paid', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    let netPointsChange = 0;

    // 1. Handle points redemption if any were used
    if (order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0) {
        if ((user.loyaltyPoints || 0) < order.loyaltyPointsUsed) {
            // This case should ideally be prevented by client-side checks, but as a safeguard:
            console.warn(`User ${user.uid} had insufficient points for order ${orderId}. Points not redeemed.`);
        } else {
            netPointsChange -= order.loyaltyPointsUsed;
            const redeemHistoryRef = db.collection(`users/${order.customerId}/points_history`).doc();
            transaction.set(redeemHistoryRef, {
                userId: order.customerId,
                pointsChange: -order.loyaltyPointsUsed,
                type: 'redeem',
                reason: `Order: ${orderId}`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    }
    
    // 2. Award points for the purchase (only for COD/unpaid orders on completion)
    if (order.paymentStatus !== 'Paid') {
        const userTier = user.membershipTier || 'silver';
        const pointsRate = loyaltySettings.pointsPer100Taka[userTier];
        const pointsEarned = Math.floor(order.totalAmount / 100) * pointsRate;

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
    
    const goldThreshold = loyaltySettings.tierThresholds.gold;
    const platinumThreshold = loyaltySettings.tierThresholds.platinum;

    if (newTotalSpent >= platinumThreshold && newTier !== 'platinum') {
      newTier = 'platinum';
    } else if (newTotalSpent >= goldThreshold && newTier === 'silver') {
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
        tierUpdateInfo = { tierUpdated: true, newTier: newTier, userId: user.uid };
    }

    transaction.update(userRef, userUpdates);
    
    return { success: true, message: `Order ${newStatus} and points updated.` };
  });
  
  return { ...transactionResult, ...tierUpdateInfo };
}


export async function POST(request: NextRequest) {
  try {
    getFirebaseAdminApp();
    const { orderId, newStatus } = await request.json();

    if (!orderId || !newStatus || (newStatus !== 'delivered' && newStatus !== 'fulfilled')) {
      return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
    }
    
    const result = await completeOrder(orderId, newStatus);
    
    if (result.success && result.tierUpdated) {
        await sendTargetedNotification({
            userId: result.userId,
            title: "Congratulations! You've Leveled Up!",
            body: `You've been promoted to the ${result.newTier.charAt(0).toUpperCase() + result.newTier.slice(1)} tier! Enjoy your new benefits.`,
            link: '/customer/subscription'
        });
    }
    
    const clientResponse = {
        success: result.success,
        message: result.message,
    };

    return NextResponse.json(clientResponse);

  } catch (error: any) {
    console.error('Error completing order:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

    