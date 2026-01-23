
'use server';

import { Order } from '@/types/order';
import { UserData } from '@/types/user';

interface SslCommerzPaymentResponse {
  status: 'SUCCESS' | 'FAILED';
  sessionkey: string;
  GatewayPageURL: string;
  failedreason?: string;
}

export async function createSslCommerzSession(order: Order, user: UserData, amount?: number) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!storeId || !storePassword || storeId === 'your_store_id') {
    throw new Error('SSLCommerz store credentials are not configured in environment variables.');
  }

  const apiUrl = isDevelopment
    ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://secure.sslcommerz.com/gwprocess/v4/api.php';
    
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  let shippingMethodString = 'Courier';
  if (order.orderMode === 'pickup') {
    shippingMethodString = 'Store Pickup';
  } else if (order.shippingMethod === 'averzo_rider') {
      shippingMethodString = 'Averzo Rider';
  } else if (order.shippingMethod === 'third_party_courier' && order.courierName) {
      shippingMethodString = order.courierName;
  }

  const postData = {
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: amount ?? order.totalAmount,
    currency: 'BDT',
    tran_id: order.id, // Must be unique
    success_url: `${baseUrl}/payment/success`,
    fail_url: `${baseUrl}/payment/fail`,
    cancel_url: `${baseUrl}/payment/cancel`,
    ipn_url: `${baseUrl}/api/payment/verify`,
    shipping_method: shippingMethodString,
    product_name: order.items.map(i => i.productName).join(', '),
    product_category: 'eCommerce',
    product_profile: 'general',
    cus_name: user.displayName,
    cus_email: user.email,
    cus_add1: order.shippingAddress?.streetAddress || 'N/A',
    cus_city: order.shippingAddress?.district || 'N/A',
    cus_state: (order.shippingAddress as any)?.division || 'N/A',
    cus_postcode: '1200', // SSLCommerz requires a postcode
    cus_country: 'Bangladesh',
    cus_phone: order.shippingAddress?.phone || 'N/A',
    ship_name: order.shippingAddress?.name || user.displayName,
    ship_add1: order.shippingAddress?.streetAddress || 'N/A',
    ship_city: order.shippingAddress?.district || 'N/A',
    ship_state: (order.shippingAddress as any)?.division || 'N/A',
    ship_postcode: '1200',
    ship_country: 'Bangladesh',
  };

  try {
    const formData = new URLSearchParams();
    for (const key in postData) {
        formData.append(key, (postData as any)[key]);
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      cache: 'no-store',
    });
    
    const data: SslCommerzPaymentResponse = await response.json();

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return { redirectUrl: data.GatewayPageURL };
    } else {
      console.error('SSLCommerz session creation failed:', data.failedreason);
      throw new Error(`Payment gateway error: ${data.failedreason || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Failed to create SSLCommerz session:', error);
    throw error;
  }
}
