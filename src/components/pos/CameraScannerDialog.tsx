'use client';

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CameraScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (decodedText: string) => void;
}

const QRCODE_REGION_ID = "html5qr-code-full-region";

export function CameraScannerDialog({ open, onOpenChange, onScanSuccess }: CameraScannerDialogProps) {

  useEffect(() => {
    if (open) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        QRCODE_REGION_ID,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      const handleSuccess = (decodedText: string, decodedResult: any) => {
        onScanSuccess(decodedText);
        html5QrcodeScanner.clear();
        onOpenChange(false);
      };

      const handleError = (error: any) => {
        // This error handler can be used for debugging, but is often noisy.
        // console.warn(`Code scan error = ${error}`);
      };

      html5QrcodeScanner.render(handleSuccess, handleError);

      return () => {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.clear().catch(err => {
              // This can happen if the component unmounts before the scanner is fully initialized.
              // It's safe to ignore in most cases.
              console.error("Failed to clear scanner on unmount. This might be expected.", err);
            });
        }
      };
    }
  }, [open, onScanSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at a product barcode.
          </DialogDescription>
        </DialogHeader>
        <div id={QRCODE_REGION_ID} className="w-full"></div>
      </DialogContent>
    </Dialog>
  );
}
