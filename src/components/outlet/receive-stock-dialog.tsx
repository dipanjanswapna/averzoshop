'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, runTransaction, increment, DocumentReference, DocumentData } from 'firebase/firestore';
import type { DeliveryChallan } from '@/types/logistics';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/types/product';

interface ReceiveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challan: DeliveryChallan;
}

export function ReceiveStockDialog({ open, onOpenChange, challan }: ReceiveStockDialogProps) {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { userData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmReceipt = async () => {
        if (!firestore || !userData?.outletId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot process receipt. System not ready.' });
            return;
        }

        const outletId = userData.outletId;
        setIsLoading(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                const challanRef = doc(firestore, 'delivery_challans', challan.id);
                const stockRequestRef = doc(firestore, 'stock_requests', challan.stockRequestId);
                
                const productRefs = new Map<string, {ref: DocumentReference, items: any[]}>();
                challan.items.forEach(item => {
                    if (!productRefs.has(item.productId)) {
                        productRefs.set(item.productId, { ref: doc(firestore, 'products', item.productId), items: [] });
                    }
                    productRefs.get(item.productId)!.items.push(item);
                });
        
                const productDocs = await Promise.all(
                    Array.from(productRefs.values()).map(p => transaction.get(p.ref))
                );

                let docIndex = 0;
                for (const [productId, { items }] of productRefs.entries()) {
                    const productDoc = productDocs[docIndex++];
                    if (!productDoc.exists()) {
                        throw new Error(`Product with ID ${productId} not found.`);
                    }
        
                    const productData = productDoc.data() as Product;
                    const variantsArray = Array.isArray(productData.variants) 
                        ? [...productData.variants.map(v => ({...v}))] 
                        : [...Object.values(productData.variants).map(v => ({...v}))];
                    
                    let totalProductIncrement = 0;
        
                    for (const item of items) {
                        const variantIndex = variantsArray.findIndex(v => v.sku === item.variantSku);
                        if (variantIndex === -1) {
                            throw new Error(`Variant SKU ${item.variantSku} not found for product ${item.productName}.`);
                        }
                        
                        const variant = variantsArray[variantIndex];
                        variant.stock = (variant.stock || 0) + item.quantity;
                        if (variant.outlet_stocks) {
                            variant.outlet_stocks[outletId] = (variant.outlet_stocks[outletId] || 0) + item.quantity;
                        } else {
                            variant.outlet_stocks = { [outletId]: item.quantity };
                        }
                        totalProductIncrement += item.quantity;
                    }
        
                    transaction.update(productDoc.ref, {
                        variants: variantsArray,
                        total_stock: increment(totalProductIncrement)
                    });
                }
                
                transaction.update(challanRef, { status: 'received' });
                transaction.update(stockRequestRef, { status: 'received' });
            });

            toast({ title: 'Stock Received!', description: 'Inventory has been updated successfully.' });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Stock receiving transaction failed:", error);
            toast({ variant: 'destructive', title: 'Transaction Failed', description: error.message || 'Could not update inventory. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Receive Stock</DialogTitle>
                    <DialogDescription>
                        Confirm receipt of items from Challan #{challan.id.substring(0, 8)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Variant SKU</TableHead>
                                <TableHead className="text-right">Expected Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {challan.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="font-mono text-xs">{item.variantSku}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirmReceipt} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Confirm Receipt'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
