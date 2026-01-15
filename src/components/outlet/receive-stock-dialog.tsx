
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
import { doc, runTransaction, increment } from 'firebase/firestore';
import type { DeliveryChallan } from '@/types/logistics';
import { useAuth } from '@/hooks/use-auth';

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

        setIsLoading(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                const challanRef = doc(firestore, 'delivery_challans', challan.id);
                const stockRequestRef = doc(firestore, 'stock_requests', challan.stockRequestId);
                
                // Update product stocks
                for (const item of challan.items) {
                    const productRef = doc(firestore, 'products', item.productId);
                    transaction.update(productRef, {
                        total_stock: increment(item.quantity),
                        [`outlet_stocks.${userData.outletId}`]: increment(item.quantity),
                    });
                }
                
                // Update challan status
                transaction.update(challanRef, { status: 'received' });
                // Update stock request status
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
                                <TableHead>Product ID</TableHead>
                                <TableHead className="text-right">Expected Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {challan.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell>{item.productId}</TableCell>
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

