'use client';
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
            <DialogContent className="sm:max-w-md w-full no-print">
                <DialogHeader>
                    <DialogTitle>Invoice Preview</DialogTitle>
                    <DialogDescription>
                       Review the receipt before printing.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="bg-gray-100 p-4 rounded-md overflow-y-auto max-h-[60vh]">
                     <div id="printable-invoice" className="mx-auto bg-white">
                        <PrintableReceipt sale={sale} outletId={outletId} />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                     <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handlePrint} className="w-full sm:w-auto gap-2">
                        <Printer size={18} /> Print Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
