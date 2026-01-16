'use client';

import React from 'react';
import Barcode from 'react-barcode';
import AverzoLogo from '@/components/averzo-logo';
import type { DeliveryChallan as ChallanType } from '@/types/logistics';
import type { UserData } from '@/types/user';
import type { Outlet } from '@/types/outlet';

interface ChallanProps {
  challan: ChallanType;
  vendor: UserData;
  outlet: Outlet;
}

export function DeliveryChallan({ challan, vendor, outlet }: ChallanProps) {
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
          <h1 className="text-3xl font-bold uppercase text-gray-700">Delivery Challan</h1>
          <p className="text-sm">Challan #<span className="font-mono">{challan.id.substring(0, 8).toUpperCase()}</span></p>
          <p className="text-sm">Date: {new Date(challan.issuedAt?.toDate()).toLocaleDateString()}</p>
        </div>
      </div>

      {/* From and To */}
      <div className="grid grid-cols-2 gap-8 my-6">
        <div>
          <p className="font-bold text-gray-600 uppercase text-sm">From (Vendor):</p>
          <p className="font-bold text-lg">{vendor.displayName}</p>
          <p className="text-sm">{vendor.email}</p>
        </div>
        <div>
          <p className="font-bold text-gray-600 uppercase text-sm">To (Outlet):</p>
          <p className="font-bold text-lg">{outlet.name}</p>
          <p className="text-sm">{outlet.location.address}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-bold uppercase text-gray-600">#</th>
              <th className="p-3 font-bold uppercase text-gray-600">Product Name</th>
              <th className="p-3 font-bold uppercase text-gray-600">Variant SKU</th>
              <th className="p-3 font-bold uppercase text-gray-600 text-right">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item, index) => (
              <tr key={item.productId + item.variantSku} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{item.productName}</td>
                <td className="p-3 font-mono text-xs">{item.variantSku}</td>
                <td className="p-3 text-right font-medium">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals and Barcode */}
      <div className="flex justify-between items-end mt-6">
        <div className="text-center">
            <Barcode value={challan.id} height={40} width={1.5} fontSize={12} />
        </div>
        <div className="text-right">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-bold uppercase text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold">{challan.totalQuantity}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-16 mt-16 pt-8 border-t">
        <div className="text-center">
          <div className="border-t-2 border-dashed w-3/4 mx-auto pt-2">
            <p className="text-sm font-bold">Signature (Sender)</p>
            <p className="text-xs text-gray-500">Vendor Representative</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-dashed w-3/4 mx-auto pt-2">
            <p className="text-sm font-bold">Signature (Receiver)</p>
            <p className="text-xs text-gray-500">Outlet Manager</p>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">This is a computer-generated challan and does not require a physical signature for system validation.</p>
    </div>
  );
}
