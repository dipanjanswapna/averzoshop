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
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';
import type { StockTransfer } from '@/types/logistics';
import type { Product } from '@/types/product';

interface ReceiveTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: StockTransfer & { sourceOutletName?: string };
}

export function ReceiveTransferDialog({ open, onOpenChange, transfer }: ReceiveTransferDialogProps) {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmReceipt = async () => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot process receipt. System not ready.' });
            return;
        }

        setIsLoading(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                const transferRef = doc(firestore, 'stock_transfers', transfer.id);
                const productRef = doc(firestore, 'products', transfer.productId);

                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw new Error(`Product with ID ${transfer.productId} not found.`);
                }
                const productData = productDoc.data() as Product;
                const variantIndex = productData.variants.findIndex(v => v.sku === transfer.variantSku);
                if (variantIndex === -1) {
                    throw new Error(`Variant ${transfer.variantSku} not found.`);
                }

                // Increment stock in the destination outlet
                const stockUpdatePath = `variants.${variantIndex}.outlet_stocks.${transfer.destinationOutletId}`;
                const variantTotalStockPath = `variants.${variantIndex}.stock`;

                transaction.update(productRef, {
                    total_stock: increment(transfer.quantity),
                    [variantTotalStockPath]: increment(transfer.quantity),
                    [stockUpdatePath]: increment(transfer.quantity)
                });
                
                transaction.update(transferRef, { status: 'received' });
            });

            toast({ title: 'Stock Received!', description: 'Inventory has been updated.' });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Stock receipt transaction failed:", error);
            toast({ variant: 'destructive', title: 'Transaction Failed', description: error.message || 'Could not update inventory.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Confirm Stock Receipt</DialogTitle>
                    <DialogDescription>
                        You are about to receive <span className="font-bold">{transfer.quantity}</span> units of <span className="font-bold">{transfer.productName} ({transfer.variantSku})</span> from <span className="font-bold">{transfer.sourceOutletName}</span>. This action will update your inventory.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                    <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                    <Button onClick={handleConfirmReceipt} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Confirm & Receive'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
