import { NextResponse, type NextRequest } from 'next/server';
import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import type { Order } from '@/types/order';
import type { POSSale } from '@/types/pos';
import type { UserData } from '@/types/user';
import type { Product } from '@/types/product';
import { sendTargetedNotification } from '@/ai/flows/send-targeted-notification';

interface LoyaltySettingsData {
    pointsPer100Taka: { silver: number; gold: number; platinum: number; };
    tierThresholds: { gold: number; platinum: number; };
}

export async function POST(request: NextRequest) {
  try {
    getFirebaseAdminApp();
    const saleData: POSSale = await request.json();
    const db = firestore();

    let tierUpdateInfo = { tierUpdated: false, newTier: '', userId: '' };

    await db.runTransaction(async (transaction) => {
        const saleRef = db.collection('pos_sales').doc(saleData.id);
        transaction.set(saleRef, { ...saleData, createdAt: admin.firestore.FieldValue.serverTimestamp() });

        for (const item of saleData.items) {
            const productRef = db.collection('products').doc(item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) throw new Error(`Product ${item.productName} not found.`);
            
            const productData = productDoc.data() as Product;
            const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : [...Object.values(productData.variants)];
            const variantIndex = variantsArray.findIndex(v => v.sku === item.variantSku);

            if (variantIndex === -1) throw new Error(`Variant ${item.variantSku} not found.`);
            
            const currentStock = variantsArray[variantIndex].outlet_stocks?.[saleData.outletId] ?? 0;
            if (currentStock < item.quantity) throw new Error(`Not enough stock for ${item.productName}. Available: ${currentStock}`);
            
            variantsArray[variantIndex].stock = (variantsArray[variantIndex].stock || 0) - item.quantity;
            variantsArray[variantIndex].outlet_stocks![saleData.outletId] = currentStock - item.quantity;

            transaction.update(productRef, {
                variants: variantsArray,
                total_stock: admin.firestore.FieldValue.increment(-item.quantity),
            });
        }

        if (saleData.promoCode) {
            const couponRef = db.collection('coupons').doc(saleData.promoCode);
            transaction.update(couponRef, { usedCount: admin.firestore.FieldValue.increment(1) });
        }

        if (saleData.customerId) {
            const userRef = db.collection('users').doc(saleData.customerId);
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return; // Optional customer
            const user = userSnap.data() as UserData;

            const settingsRef = db.collection('settings').doc('loyalty');
            const settingsSnap = await transaction.get(settingsRef);
            if (!settingsSnap.exists()) throw new Error("Loyalty settings not configured.");
            const settings = settingsSnap.data() as LoyaltySettingsData;
            
            let netPointsChange = 0;
            const loyaltyPointsUsed = saleData.loyaltyPointsUsed || 0;

            if (loyaltyPointsUsed > 0) {
                 if ((user.loyaltyPoints || 0) < loyaltyPointsUsed) {
                    throw new Error("Insufficient loyalty points for redemption.");
                }
                netPointsChange -= loyaltyPointsUsed;
                const redeemHistoryRef = db.collection(`users/${saleData.customerId}/points_history`).doc();
                transaction.set(redeemHistoryRef, {
                    userId: saleData.customerId,
                    pointsChange: -loyaltyPointsUsed,
                    type: 'redeem',
                    reason: `POS Sale: ${saleData.id}`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            
            const userTier = user.membershipTier || 'silver';
            const pointsRate = settings.pointsPer100Taka[userTier];
            let pointsEarned = 0;
            
            if (typeof pointsRate === 'number') {
                pointsEarned = Math.floor(saleData.totalAmount / 100) * pointsRate;
            } else {
                 console.warn(`Invalid points rate for tier: ${userTier}. Defaulting to 0.`);
            }
            
            if (pointsEarned > 0) {
                netPointsChange += pointsEarned;
                const earnHistoryRef = db.collection(`users/${saleData.customerId}/points_history`).doc();
                transaction.set(earnHistoryRef, {
                    userId: saleData.customerId,
                    pointsChange: pointsEarned,
                    type: 'earn',
                    reason: `POS Sale: ${saleData.id}`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            const newTotalSpent = (user.totalSpent || 0) + saleData.totalAmount;
            let newTier = user.membershipTier || 'silver';
            const goldThreshold = settings.tierThresholds.gold;
            const platinumThreshold = settings.tierThresholds.platinum;

            if (newTotalSpent >= platinumThreshold && newTier !== 'platinum') {
                newTier = 'platinum';
            }
            else if (newTotalSpent >= goldThreshold && newTier === 'silver') {
                newTier = 'gold';
            }
            
            let userUpdates: any = {
                totalSpent: admin.firestore.FieldValue.increment(saleData.totalAmount),
            };
            if (netPointsChange !== 0) {
                userUpdates.loyaltyPoints = admin.firestore.FieldValue.increment(netPointsChange);
            }
            if (newTier !== user.membershipTier) {
                userUpdates.membershipTier = newTier;
                if(saleData.customerId) {
                    tierUpdateInfo = { tierUpdated: true, newTier: newTier, userId: saleData.customerId };
                }
            }
            transaction.update(userRef, userUpdates);
        }
    });

    if (tierUpdateInfo.tierUpdated) {
        await sendTargetedNotification({
            userId: tierUpdateInfo.userId,
            title: "Congratulations! You've Leveled Up!",
            body: `You've been promoted to the ${tierUpdateInfo.newTier.charAt(0).toUpperCase() + tierUpdateInfo.newTier.slice(1)} tier! Enjoy your new benefits.`,
            link: '/customer/subscription'
        });
    }

    return NextResponse.json({ success: true, message: 'Sale completed successfully.' });

  } catch (error: any) {
    console.error('POS Sale completion error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
