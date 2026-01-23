'use client';
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { Printer, Download, Loader2 } from 'lucide-react';
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
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const element = invoiceRef.current;
        if (!element) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            
            // Using jspdf
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            
            const ratio = imgWidth / imgHeight;
            let width = pdfWidth - 20; // with some margin
            let height = width / ratio;

            if (height > pdfHeight - 20) {
              height = pdfHeight - 20;
              width = height * ratio;
            }
            
            const x = (pdfWidth - width) / 2;
            const y = 10;
            
            pdf.addImage(imgData, 'PNG', x, y, width, height);
            pdf.save(`Averzo-Invoice-${order?.id.substring(0,8)}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            // toast({ variant: 'destructive', title: 'Failed to generate PDF' });
        } finally {
            setIsDownloading(false);
        }
    };


    if (!order) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-4xl no-print">
                    <DialogHeader>
                        <DialogTitle>Invoice Preview</DialogTitle>
                        <DialogDescription>
                            Review the invoice before printing or downloading.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-muted p-2 md:p-4 overflow-auto max-h-[60vh] my-4 rounded-md">
                        {/* The ref is on the wrapper of the component to be printed */}
                        <div ref={invoiceRef} className="mx-auto bg-white dark:bg-card">
                            <PrintableInvoice order={order} customer={customer} />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                        </DialogClose>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button onClick={handleDownloadPdf} className="w-full gap-2" disabled={isDownloading}>
                                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                Download PDF
                            </Button>
                            <Button onClick={handlePrint} className="w-full gap-2">
                                <Printer size={18} /> Print Now
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* This hidden element is for the browser's native print function */}
            <div className="printable-area">
                <PrintableInvoice order={order} customer={customer} />
            </div>
        </>
    );
}
