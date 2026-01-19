
import { NextResponse, type NextRequest } from 'next/server';
import { firestore } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order';

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

    if (
      gatewayData.status === 'VALID' &&
      Math.abs(parseFloat(gatewayData.amount) - orderData.totalAmount) < 0.01 &&
      gatewayData.tran_id === tran_id &&
      orderData.status === 'pending_payment' // Crucial check
    ) {
      
      await firestore().runTransaction(async (transaction) => {
        transaction.update(orderRef, {
            status: 'new',
            paymentStatus: 'Paid',
            gatewayTransactionId: val_id,
            updatedAt: FieldValue.serverTimestamp()
        });

        const allProductIds = [...new Set(orderData.items.map(item => item.productId))];
        if (allProductIds.length === 0) return;
        
        const productRefs = allProductIds.map(id => firestore().collection('products').doc(id));
        const productDocs = await transaction.getAll(...productRefs);
        const productMap = new Map(productDocs.map(doc => [doc.id, doc.data() as Product]));

        for (const item of orderData.items) {
          const product = productMap.get(item.productId);
          if (!product || product.preOrder?.enabled) continue; // Skip stock reduction for pre-order items

          const productRef = firestore().collection('products').doc(item.productId);
          const variantsArray = Array.isArray(product.variants) ? [...product.variants] : Object.values(product.variants);
          const variantIndex = variantsArray.findIndex(v => v.sku === item.variantSku);

          if (variantIndex === -1) throw new Error(`Variant ${item.variantSku} not found for product ${product.name}.`);
          
          const variant = variantsArray[variantIndex];
          const currentOutletStock = variant.outlet_stocks?.[orderData.assignedOutletId] ?? 0;
          if (currentOutletStock < item.quantity) throw new Error(`Not enough stock for ${product.name} in outlet ${orderData.assignedOutletId}.`);
          
          variantsArray[variantIndex].stock -= item.quantity;
          if (variantsArray[variantIndex].outlet_stocks) {
            variantsArray[variantIndex].outlet_stocks[orderData.assignedOutletId] = currentOutletStock - item.quantity;
          }

          transaction.update(productRef, {
              variants: variantsArray,
              total_stock: FieldValue.increment(-item.quantity),
          });
        }
      });

      return NextResponse.json({ status: 'Success', message: 'Payment Verified and Order Confirmed.' });
    } else {
      let reason = 'Unknown validation failure.';
      if (gatewayData.status !== 'VALID') reason = 'Gateway status was not VALID.';
      else if (Math.abs(parseFloat(gatewayData.amount) - orderData.totalAmount) >= 0.01) reason = 'Amount mismatch.';
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
