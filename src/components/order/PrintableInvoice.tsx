'use client';

import React from 'react';
import Barcode from 'react-barcode';
import AverzoLogo from '@/components/averzo-logo';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';

interface InvoiceProps {
  order: Order;
  customer?: UserData | null;
}

export function PrintableInvoice({ order, customer }: InvoiceProps) {
  const saleDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <AverzoLogo className="text-4xl" />
          <p className="text-xs text-gray-500 mt-1">
            House 123, Road 45, Gulshan 2, Dhaka-1212<br />
            Email: support@averzo.com | Phone: +880 9600 000 000
          </p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold uppercase text-gray-700">Invoice</h1>
          <p className="text-sm">Order #<span className="font-mono">{order.id.substring(0, 8).toUpperCase()}</span></p>
          <p className="text-sm">Date: {saleDate.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="my-6">
        <p className="font-bold text-gray-600 uppercase text-sm">Bill To:</p>
        <p className="font-bold text-lg">{order.shippingAddress?.name || customer?.displayName}</p>
        <p className="text-sm">{order.shippingAddress?.streetAddress}, {order.shippingAddress?.area}</p>
        <p className="text-sm">{order.shippingAddress?.district}</p>
        <p className="text-sm">{order.shippingAddress?.phone}</p>
        <p className="text-sm">{customer?.email}</p>
      </div>

      {/* Items Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-bold uppercase text-gray-600">Product Name</th>
              <th className="p-3 font-bold uppercase text-gray-600">SKU</th>
              <th className="p-3 font-bold uppercase text-gray-600 text-center">Qty</th>
              <th className="p-3 font-bold uppercase text-gray-600 text-right">Price</th>
              <th className="p-3 font-bold uppercase text-gray-600 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.variantSku} className="border-b">
                <td className="p-3 font-medium">{item.productName}</td>
                <td className="p-3 font-mono text-xs">{item.variantSku}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-right">৳{item.price.toFixed(2)}</td>
                <td className="p-3 text-right font-medium">৳{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals and Barcode */}
      <div className="flex justify-between items-start mt-6">
        <div className="text-center">
            <Barcode value={order.id} height={40} width={1.5} fontSize={12} />
        </div>
        <div className="w-full max-w-xs text-sm">
            <div className="flex justify-between py-1"><span>Subtotal:</span><span>৳{order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span></div>
            {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between py-1"><span>Coupon Discount:</span><span>- ৳{order.discountAmount.toFixed(2)}</span></div>
            ) : null}
            {order.loyaltyDiscount && order.loyaltyDiscount > 0 ? (
                <div className="flex justify-between py-1"><span>Loyalty Discount:</span><span>- ৳{order.loyaltyDiscount.toFixed(2)}</span></div>
            ): null}
             {order.cardPromoDiscountAmount && order.cardPromoDiscountAmount > 0 ? (
                <div className="flex justify-between py-1"><span>Card Promo:</span><span>- ৳{order.cardPromoDiscountAmount.toFixed(2)}</span></div>
            ): null}
             {order.giftCardDiscount && order.giftCardDiscount > 0 ? (
                <div className="flex justify-between py-1"><span>Gift Card:</span><span>- ৳{order.giftCardDiscount.toFixed(2)}</span></div>
            ): null}
             <div className="flex justify-between py-1 border-t mt-1 pt-1 font-bold text-lg text-primary"><span>Total Paid:</span><span>৳{order.totalAmount.toFixed(2)}</span></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
}
