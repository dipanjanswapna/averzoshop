
'use client';
import React from 'react';
import Barcode from 'react-barcode';
import type { POSSale } from '@/types/pos';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';

interface PrintableReceiptProps {
  sale: POSSale;
  outletId: string;
}

export function PrintableReceipt({ sale, outletId }: PrintableReceiptProps) {
    const { data: outlets, isLoading } = useFirestoreQuery<Outlet>('outlets');
    const outlet = outlets?.find(o => o.id === outletId);

    if (isLoading) {
        return <div className="printable-receipt p-4">Loading receipt...</div>;
    }

    if (!outlet) {
        return <div className="printable-receipt p-4">Outlet information not found.</div>;
    }

    return (
        <div className="printable-receipt p-4 bg-white text-black font-mono">
            <div className="w-[80mm] mx-auto p-2 text-xs">
                <div className="text-center mb-4">
                    <h1 className="text-lg font-bold">Averzo</h1>
                    <p>{outlet.name}</p>
                    <p>{outlet.location.address}</p>
                    <p>Date: {new Date(sale.createdAt?.seconds * 1000 || Date.now()).toLocaleString()}</p>
                </div>

                <div className="border-t border-b border-dashed border-black py-2 my-2">
                    <div className="flex justify-between font-bold">
                        <span>Item</span>
                        <span>Total</span>
                    </div>
                    {sale.items.map((item, index) => (
                        <div key={index}>
                            <p>{item.quantity} x {item.productName}</p>
                            <div className="flex justify-between pl-2">
                                <span className='text-[10px]'>{item.variantSku}</span>
                                <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{sale.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                        <span>TOTAL:</span>
                        <span>৳{sale.totalAmount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className='capitalize'>{sale.paymentMethod}</span>
                    </div>
                </div>

                <div className="text-center mt-4 border-t border-dashed border-black pt-2">
                    <p className="font-bold">Thank you for your purchase!</p>
                    <div className="flex justify-center mt-2">
                         <Barcode value={sale.id} height={40} width={1.5} fontSize={10} margin={2} />
                    </div>
                </div>
            </div>
        </div>
    );
}
