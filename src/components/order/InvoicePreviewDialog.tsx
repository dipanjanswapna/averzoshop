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
import { PrintableInvoice } from './PrintableInvoice';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  customer: UserData | null;
}

export function InvoicePreviewDialog({ open, onOpenChange, order, customer }: InvoicePreviewDialogProps) {
    const handlePrint = () => {
        window.print();
    };

    if (!order) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full no-print">
                    <DialogHeader>
                        <DialogTitle>Invoice Preview</DialogTitle>
                        <DialogDescription>
                            Review the invoice before printing.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-md overflow-y-auto max-h-[60vh] my-4">
                        <div className="mx-auto bg-white dark:bg-card">
                            <PrintableInvoice order={order} customer={customer} />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                        </DialogClose>
                        <Button onClick={handlePrint} className="w-full sm:w-auto gap-2">
                            <Printer size={18} /> Print Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* This is the hidden element that will be printed */}
            <div className="printable-area">
                <PrintableInvoice order={order} customer={customer} />
            </div>
        </>
    );
}
