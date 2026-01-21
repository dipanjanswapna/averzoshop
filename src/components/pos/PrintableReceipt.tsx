'use client';
import React, { useMemo } from 'react';
import type { Outlet } from '@/types/outlet';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useFirebase } from '@/firebase';
import { query, collection } from 'firebase/firestore';
import Barcode from 'react-barcode';

interface PrintableReceiptProps {
  sale: any;
  outletId: string;
}

export function PrintableReceipt({ sale, outletId }: PrintableReceiptProps) {
    const { firestore } = useFirebase();
    
    const outletsQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'outlets'));
    }, [firestore]);

    const { data: outlets, isLoading } = useFirestoreQuery<Outlet>(outletsQuery);
    const outlet = useMemo(() => outlets?.find(o => o.id === outletId), [outlets, outletId]);

    const saleDate = sale.createdAt?.seconds ? new Date(sale.createdAt.seconds * 1000) : new Date();
    
    if (isLoading && !outlet) {
        return <div className="p-2">Loading outlet details...</div>;
    }

    return (
        <div className="w-[80mm] p-2 font-mono text-[10px] leading-tight text-black bg-white">
            <div className="text-center space-y-1 mb-2 border-b border-dashed pb-2">
                <h2 className="text-sm font-bold uppercase tracking-tighter">AVERZO</h2>
                <p className="text-[9px]">Trade License: TRAD/DNCC/XXXXXX</p>
                <p className="text-[9px]">VAT Reg: 00XXXXXXXX-XXXX</p>
                {outlet && <p className="text-[9px]">Address: {outlet.location.address}</p>}
                <p className="text-[9px] font-bold mt-1">Sale ID: #{sale.id.substring(0, 8).toUpperCase()}</p>
                 <p className="text-[9px]">Date: {saleDate.toLocaleString()}</p>
            </div>

            <table className="w-full text-[9px]">
                <thead>
                    <tr className="border-b border-dashed">
                        <th className="py-1 text-left w-1/2">Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item: any, index: number) => (
                        <tr key={index}>
                            <td className="py-0.5 align-top">
                                {item.productName}
                                <br />
                                <span className="text-gray-600">{item.variantSku}</span>
                            </td>
                            <td className="py-0.5 text-center align-top">{item.quantity}</td>
                            <td className="py-0.5 text-right align-top">৳{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-[10px] space-y-0.5 border-t border-dashed mt-2 pt-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>৳{sale.subtotal.toFixed(2)}</span></div>
                {sale.discountAmount > 0 && (
                    <div className="flex justify-between">
                        <span>Promo Discount ({sale.promoCode}):</span>
                        <span>- ৳{sale.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                 {sale.loyaltyDiscount > 0 && (
                    <div className="flex justify-between">
                        <span>Loyalty Discount:</span>
                        <span>- ৳{sale.loyaltyDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-xs border-t border-dotted mt-1 pt-1">
                    <span>Grand Total:</span>
                    <span>৳{sale.totalAmount.toFixed(2)}</span>
                </div>
                 {sale.paymentMethod === 'cash' && (
                    <>
                         <div className="flex justify-between mt-2 pt-2 border-t border-dotted">
                             <span>Cash Received:</span>
                             <span>৳{(sale.cashReceived || 0).toFixed(2)}</span>
                         </div>
                        <div className="flex justify-between text-xs font-black">
                            <span>Change Due:</span><span>৳{(sale.changeDue || 0).toFixed(2)}</span>
                        </div>
                    </>
                )}
            </div>
             <div className="text-center mt-4 text-[9px]">
                <div className="flex justify-center">
                    <Barcode value={sale.id} height={40} width={1.5} fontSize={12} />
                </div>
                <p className="font-bold italic mt-2">Thank you for shopping!</p>
                <p>Software by: Averzo</p>
                <p>Return policy: Within 7 days with invoice.</p>
            </div>
        </div>
    );
}
