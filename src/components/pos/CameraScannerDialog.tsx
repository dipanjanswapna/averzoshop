'use client';

import { useEffect, useRef } from 'react';
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // This effect handles the creation and cleanup of the scanner
    if (open) {
      // Only initialize if it doesn't exist
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          QRCODE_REGION_ID,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        const handleSuccess = (decodedText: string) => {
          onScanSuccess(decodedText);
          onOpenChange(false);
        };

        const handleError = (error: any) => {
          // This callback is required, but we can ignore most errors.
          // e.g. "QR code parse error"
        };

        scanner.render(handleSuccess, handleError);
        scannerRef.current = scanner;
      }
    }

    // Cleanup function for when the dialog is closed or component unmounts
    return () => {
      if (scannerRef.current) {
        // Check if scanner is still scanning before trying to clear
        if (scannerRef.current.isScanning) {
          scannerRef.current.clear().catch(error => {
            console.error("Scanner cleanup failed:", error);
          });
        }
        scannerRef.current = null;
      }
    };
  }, [open, onOpenChange, onScanSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
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
