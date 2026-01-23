'use server';

import { firestore, getFirebaseAdminApp } from '@/firebase/server';
import * as admin from 'firebase-admin';
import { revalidatePath } from 'next/cache';
import type { Order } from '@/types/order';
import type { Product, ProductVariant } from '@/types/product';

interface CancelOrderResult {
  success: boolean;
  message: string;
}

export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  if (!orderId) {
    return { success: false, message: 'Order ID is required.' };
  }

  try {
    getFirebaseAdminApp();
    const db = firestore();
    const orderRef = db.collection('orders').doc(orderId);

    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error("Order not found.");
      }
      const order = orderDoc.data() as Order;

      if (['canceled', 'delivered', 'fulfilled'].includes(order.status)) {
        throw new Error(`Order has already been processed and cannot be canceled.`);
      }

      // Only restore stock if payment was made or if it's a COD order that reserved stock.
      // Pre-orders don't reserve stock until final payment, so they are excluded here.
      if (order.paymentStatus === 'Paid' || order.orderType === 'regular') {
        const productRefs = [...new Set(order.items.map(item => db.collection('products').doc(item.productId)))];
        if (productRefs.length > 0) {
            const productDocs = await transaction.getAll(...productRefs);
            
            for (const productDoc of productDocs) {
                if (!productDoc.exists) continue;

                const productData = productDoc.data() as Product;
                const itemsToUpdateForThisProduct = order.items.filter(i => i.productId === productDoc.id);

                const variantsArray = Array.isArray(productData.variants) 
                    ? JSON.parse(JSON.stringify(productData.variants)) 
                    : JSON.parse(JSON.stringify(Object.values(productData.variants || {})));

                let totalStockIncrement = 0;

                for (const item of itemsToUpdateForThisProduct) {
                    const variantIndex = variantsArray.findIndex((v: ProductVariant) => v.sku === item.variantSku);
                    if (variantIndex !== -1) {
                        const variant = variantsArray[variantIndex];
                        variant.stock = (variant.stock || 0) + item.quantity;
                        if (order.assignedOutletId && variant.outlet_stocks) {
                            variant.outlet_stocks[order.assignedOutletId] = (variant.outlet_stocks[order.assignedOutletId] || 0) + item.quantity;
                        }
                        totalStockIncrement += item.quantity;
                    }
                }

                transaction.update(productDoc.ref, {
                    variants: variantsArray,
                    total_stock: admin.firestore.FieldValue.increment(totalStockIncrement),
                });
            }
        }
      }

      // Update order status
      transaction.update(orderRef, { status: 'canceled', paymentStatus: 'Failed', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    revalidatePath('/customer/my-orders');
    revalidatePath(`/customer/my-orders/${orderId}`);
    revalidatePath('/dashboard/orders');
    revalidatePath('/outlet/orders');

    return { success: true, message: 'Order has been canceled successfully.' };
  } catch (error: any) {
    console.error("Error canceling order:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
