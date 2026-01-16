
import { NextResponse, type NextRequest } from 'next/server';
import { firestore } from '@/firebase/server';

// This is an example of a server-side API route for payment verification.
// It should be called by the payment gateway's IPN (Instant Payment Notification) or callback.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tran_id, val_id, amount, status } = body;

    // These should be set in your .env.local file
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Use sandbox URL for development and live URL for production
    const validationApiUrl = isDevelopment 
      ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://secure.sslcommerz.com/validator/api/validationserverAPI.php';


    if (!storeId || !storePassword) {
        console.error("SSLCommerz store ID or password is not configured in environment variables.");
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }
    
    // Step 1: Check if the payment was actually successful according to the gateway
    if (status !== 'VALID') {
        // Here you might want to update your database to mark the transaction as 'Failed'.
        return NextResponse.json({ status: 'Failed', message: 'Payment was not successful.' }, { status: 400 });
    }

    // Step 2: Verify the transaction with SSLCommerz's server (Server-to-Server)
    const verificationUrl = `${validationApiUrl}?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePassword}`;
    
    const response = await fetch(verificationUrl);
    if (!response.ok) {
        throw new Error(`Gateway validation request failed with status: ${response.status}`);
    }
    const gatewayData = await response.json();

    // Fetch the original order from your database to verify the amount
    const orderRef = firestore().collection('orders').doc(tran_id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        return NextResponse.json({ status: 'Failed', message: 'Transaction ID not found in our system.' }, { status: 404 });
    }
    const orderData = orderDoc.data();
    if (!orderData) {
        return NextResponse.json({ status: 'Failed', message: 'Could not retrieve order data.' }, { status: 500 });
    }

    // Step 3: Security Checks - Is the amount correct? Is the status VALID?
    if (
      gatewayData.status === 'VALID' &&
      parseFloat(gatewayData.amount) === parseFloat(orderData.totalAmount) && // Compare with YOUR DB amount
      gatewayData.tran_id === tran_id
    ) {
      // Step 4: Payment is verified. Update the order status and reduce stock.
      await orderRef.update({
        status: 'new', // Or 'preparing', depends on your fulfillment flow
        paymentStatus: 'Paid',
        gatewayTransactionId: val_id,
        updatedAt: new Date()
      });
      
      // Here you would also handle stock reduction. 
      // This is a critical step and should be done in a transaction.

      return NextResponse.json({ status: 'Success', message: 'Payment Verified and Order Confirmed.' });
    } else {
      // Log the failure reason for debugging
      console.warn('Fraudulent or failed transaction detected during server validation.', { gatewayData, orderData });
      
      // Update order status to 'Failed' or 'Fraud'
      await orderRef.update({
          paymentStatus: 'Failed',
          status: 'canceled'
      });

      return NextResponse.json({ status: 'Failed', message: 'Payment validation failed. Transaction mismatch.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
