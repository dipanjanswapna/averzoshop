import { NextResponse, type NextRequest } from 'next/server';
import { firestore } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { Product, ProductVariant } from '@/types/product';
import type { Order } from '@/types/order';
import type { GiftCard } from '@/types/gift-card';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const tran_id = body.get('tran_id') as string;
    const val_id = body.get('val_id') as string;
    const status = body.get('status') as string;

    if (!tran_id) {
        return NextResponse.json({ message: 'Transaction ID is missing.' }, { status: 400 });
    }
    
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const validationApiUrl = isDevelopment 
      ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://secure.sslcommerz.com/validator/api/validationserverAPI.php';


    if (!storeId || !storePassword || storeId === 'your_store_id') {
        console.error("SSLCommerz store ID or password is not configured in environment variables.");
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }
    
    if (status !== 'VALID') {
        await firestore().collection('orders').doc(tran_id).update({
          paymentStatus: 'Failed',
          status: 'canceled'
        }).catch(err => console.error("Failed to update order to 'Failed' for tran_id:", tran_id, err));
        
        return NextResponse.json({ status: 'Failed', message: 'Payment was not successful.' });
    }

    const verificationUrl = `${validationApiUrl}?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
    
    const response = await fetch(verificationUrl);
    if (!response.ok) {
        throw new Error(`Gateway validation request failed with status: ${response.status}`);
    }
    const gatewayData = await response.json();
    
    const orderRef = firestore().collection('orders').doc(tran_id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        return NextResponse.json({ status: 'Failed', message: 'Transaction ID not found in our system.' }, { status: 404 });
    }
    const orderData = orderDoc.data() as Order;

    const isPreOrderCompletion = orderData.status === 'pending_payment' && orderData.orderType === 'pre-order';
    let expectedAmount = orderData.totalAmount;

    if (isPreOrderCompletion) {
      expectedAmount = (orderData.fullOrderValue ?? orderData.totalAmount) - orderData.totalAmount;
    }

    if (
      gatewayData.status === 'VALID' &&
      Math.abs(parseFloat(gatewayData.amount) - expectedAmount) < 0.01 &&
      gatewayData.tran_id === tran_id &&
      orderData.status === 'pending_payment'
    ) {
      
      await firestore().runTransaction(async (transaction) => {
        const currentOrderSnap = await transaction.get(orderRef);
        if (!currentOrderSnap.exists) throw new Error("Order not found during transaction.");
        const currentOrderData = currentOrderSnap.data() as Order;
        
        const regularItems = currentOrderData.items.filter(item => {
          const productRef = firestore().collection('products').doc(item.productId);
          return transaction.get(productRef).then(p => !p.data()?.preOrder?.enabled);
        });

        const productRefs = [...new Set(regularItems.map(item => firestore().collection('products').doc(item.productId)))];
        const productDocsSnapshots = productRefs.length > 0 ? await Promise.all(productRefs.map(ref => transaction.get(ref))) : [];
        
        const userRef = firestore().collection('users').doc(currentOrderData.customerId);
        const userDoc = await transaction.get(userRef);

        const productMap = new Map<string, Product>();
        productDocsSnapshots.forEach(docSnap => {
            if (docSnap.exists) {
                productMap.set(docSnap.id, docSnap.data() as Product);
            }
        });
    
        // Update order status and payment details
        if (isPreOrderCompletion) {
          transaction.update(orderRef, {
            status: 'new',
            paymentStatus: 'Paid',
            gatewayTransactionId: val_id,
            totalAmount: currentOrderData.fullOrderValue,
            updatedAt: FieldValue.serverTimestamp()
          });
        } else {
          transaction.update(orderRef, {
            status: 'new',
            paymentStatus: 'Paid',
            gatewayTransactionId: val_id,
            updatedAt: FieldValue.serverTimestamp()
          });
        }
    
        // Deduct stock for regular (non-pre-order) items, only if it's the initial payment
        if (!isPreOrderCompletion) {
          for (const item of regularItems) {
              const product = productMap.get(item.productId);
              if (!product) continue; 
              
              const productRefToUpdate = firestore().collection('products').doc(item.productId);
              const variantsArray = JSON.parse(JSON.stringify(Array.isArray(product.variants) ? product.variants : Object.values(product.variants)));
              
              const variantIndex = variantsArray.findIndex((v: ProductVariant) => v.sku === item.variantSku);
              if (variantIndex === -1) throw new Error(`Variant ${item.variantSku} not found for product ${product.name}.`);
              
              const variant = variantsArray[variantIndex];
              const currentOutletStock = variant.outlet_stocks?.[currentOrderData.assignedOutletId!] ?? 0;
              if (currentOutletStock < item.quantity) {
                  throw new Error(`Not enough stock for ${product.name} in outlet ${currentOrderData.assignedOutletId}.`);
              }
              
              variant.stock = (variant.stock || 0) - item.quantity;
              if (variant.outlet_stocks && currentOrderData.assignedOutletId) {
                  variant.outlet_stocks[currentOrderData.assignedOutletId] = currentOutletStock - item.quantity;
              }
      
              transaction.update(productRefToUpdate, {
                  variants: variantsArray,
                  total_stock: FieldValue.increment(-item.quantity),
              });
          }
        }
    
        // Handle gift card balance deduction, only on initial payment
        if (currentOrderData.giftCardCode && currentOrderData.giftCardDiscount && currentOrderData.giftCardDiscount > 0 && !isPreOrderCompletion) {
            const giftCardRef = firestore().collection('gift_cards').doc(currentOrderData.giftCardCode);
            const giftCardDoc = await transaction.get(giftCardRef);
            if (!giftCardDoc.exists) throw new Error('Gift Card not found during transaction.');
            const giftCard = giftCardDoc.data() as GiftCard;
            if (!giftCard.isEnabled || giftCard.balance < currentOrderData.giftCardDiscount) {
                throw new Error('Gift card is invalid or has insufficient balance.');
            }
            transaction.update(giftCardRef, { balance: FieldValue.increment(-currentOrderData.giftCardDiscount) });
        }


        if(userDoc.exists) {
            const loyaltyPointsUsed = currentOrderData.loyaltyPointsUsed || 0;

            // Only handle redemption here. Earning happens on completion.
            if (loyaltyPointsUsed > 0 && !isPreOrderCompletion) {
                const userPoints = userDoc.data()?.loyaltyPoints || 0;
                if (userPoints < loyaltyPointsUsed) {
                    throw new Error("Insufficient loyalty points on user account.");
                }
                transaction.update(userRef, { loyaltyPoints: FieldValue.increment(-loyaltyPointsUsed) });
                const redeemHistoryRef = firestore().collection(`users/${currentOrderData.customerId}/points_history`).doc();
                transaction.set(redeemHistoryRef, {
                    userId: currentOrderData.customerId, pointsChange: -loyaltyPointsUsed, type: 'redeem',
                    reason: `Online Order: ${tran_id}`, createdAt: FieldValue.serverTimestamp(),
                });
            }
        }
      });

      return NextResponse.json({ status: 'Success', message: 'Payment Verified and Order Confirmed.' });
    } else {
      let reason = 'Unknown validation failure.';
      if (gatewayData.status !== 'VALID') reason = 'Gateway status was not VALID.';
      else if (Math.abs(parseFloat(gatewayData.amount) - expectedAmount) >= 0.01) reason = `Amount mismatch. Expected: ${expectedAmount}, Got: ${gatewayData.amount}`;
      else if (orderData.status !== 'pending_payment') reason = `Order status was not 'pending_payment', it was '${orderData.status}'.`;

      console.warn('Fraudulent or failed transaction detected during server validation.', { reason, gatewayData, orderData });
      
      await orderRef.update({
          paymentStatus: 'Failed',
          status: 'canceled'
      }).catch(err => console.error("Failed to update order to 'Failed' on validation fail:", tran_id, err));

      return NextResponse.json({ status: 'Failed', message: 'Payment validation failed. Transaction mismatch.' });
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    const bodyForError = await request.formData().catch(()=>null);
    const tran_id_for_error = bodyForError?.get('tran_id');
    console.error(`Error for tran_id: ${tran_id_for_error || 'unknown'}`)
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
