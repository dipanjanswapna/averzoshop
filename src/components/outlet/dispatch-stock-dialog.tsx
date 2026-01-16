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

interface DispatchStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: StockTransfer & { destinationOutletName?: string };
}

export function DispatchStockDialog({ open, onOpenChange, transfer }: DispatchStockDialogProps) {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmDispatch = async () => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot process dispatch. System not ready.' });
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

                const stockUpdatePath = `variants.${variantIndex}.outlet_stocks.${transfer.sourceOutletId}`;
                const currentStock = productData.variants[variantIndex].outlet_stocks?.[transfer.sourceOutletId] ?? 0;
                
                if (currentStock < transfer.quantity) {
                     throw new Error(`Not enough stock for ${transfer.productName}. Available: ${currentStock}`);
                }

                // Decrement stock from source outlet's variant stock. Total stock remains the same for now.
                transaction.update(productRef, {
                    [stockUpdatePath]: increment(-transfer.quantity),
                });
                
                // Update the transfer status to 'dispatched'
                transaction.update(transferRef, { status: 'dispatched' });
            });

            toast({ title: 'Stock Dispatched!', description: 'Inventory has been updated.' });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Stock dispatch transaction failed:", error);
            toast({ variant: 'destructive', title: 'Transaction Failed', description: error.message || 'Could not update inventory.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Confirm Stock Dispatch</DialogTitle>
                    <DialogDescription>
                        You are about to dispatch <span className="font-bold">{transfer.quantity}</span> units of <span className="font-bold">{transfer.productName} ({transfer.variantSku})</span> to <span className="font-bold">{transfer.destinationOutletName}</span>. This action will deduct stock from your inventory and cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                    <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                    <Button onClick={handleConfirmDispatch} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Confirm & Dispatch'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
