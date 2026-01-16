'use client';
import React from 'react';
import Barcode from 'react-barcode';
import type { POSSale } from '@/types/pos';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';

interface PrintableReceiptProps {
  sale: POSSale & { cashReceived?: number, changeDue?: number };
  outletId: string;
}

export function PrintableReceipt({ sale, outletId }: PrintableReceiptProps) {
    const { data: outlets, isLoading } = useFirestoreQuery<Outlet>('outlets');
    const outlet = outlets?.find(o => o.id === outletId);

    const saleDate = sale.createdAt?.seconds ? new Date(sale.createdAt.seconds * 1000) : new Date();

    if (isLoading && !outlet) {
        return <div className="printable-receipt p-2">Loading outlet details...</div>;
    }

    return (
        <div className="printable-receipt p-2 bg-white text-black font-mono w-full">
            <div className="text-center mb-2">
                <h1 className="text-base font-bold">AVERZO.</h1>
                {outlet && (
                    <>
                        <p className="text-[10px]">{outlet.name}</p>
                        <p className="text-[10px]">{outlet.location.address}</p>
                    </>
                )}
                <p className="text-[10px]">Date: {saleDate.toLocaleString()}</p>
            </div>

            <div className="border-t border-b border-dashed border-black py-1 my-1 text-[10px]">
                <div className="flex justify-between font-bold">
                    <span>Item</span>
                    <span className="text-right">Total</span>
                </div>
                {sale.items.map((item, index) => (
                    <div key={index}>
                        <p>{item.quantity} x {item.productName}</p>
                        <div className="flex justify-between pl-2">
                            <span className='text-[9px]'>{item.variantSku}</span>
                            <span className="text-right">৳{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-0.5 text-[10px] border-b border-dashed border-black pb-1 mb-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{sale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs">
                    <span>TOTAL:</span>
                    <span>৳{sale.totalAmount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className='capitalize'>{sale.paymentMethod}</span>
                </div>
                {sale.paymentMethod === 'cash' && sale.cashReceived && (
                    <>
                        <div className="flex justify-between">
                            <span>Cash Received:</span>
                            <span>৳{sale.cashReceived.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Change Due:</span>
                            <span>৳{Math.max(0, sale.changeDue || 0).toFixed(2)}</span>
                        </div>
                    </>
                )}
            </div>

            <div className="text-center mt-2">
                <p className="font-bold text-xs">Thank you for your purchase!</p>
                <div className="flex justify-center mt-1">
                     <Barcode value={sale.id} height={30} width={1} fontSize={8} margin={2} />
                </div>
            </div>
        </div>
    );
}
