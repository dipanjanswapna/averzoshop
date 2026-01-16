'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { PrintableReceipt } from './PrintableReceipt';
import type { POSSale } from '@/types/pos';

interface ReceiptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: POSSale & { cashReceived?: number, changeDue?: number };
  outletId: string;
}

export function ReceiptPreviewDialog({ open, onOpenChange, sale, outletId }: ReceiptPreviewDialogProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Sale Completed</DialogTitle>
                    <DialogDescription>
                        Receipt generated. Ready to print.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="p-4">
                     <div className="mx-auto" style={{ width: '80mm' }}>
                        <PrintableReceipt sale={sale} outletId={outletId} />
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/50">
                    <Button onClick={handlePrint} className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
