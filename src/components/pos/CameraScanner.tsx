
'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraScannerProps {
  onScan: (sku: string) => void;
}

const SCANNER_REGION_ID = "barcode-reader";

export function CameraScanner({ onScan }: CameraScannerProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      const scanner = new Html5QrcodeScanner(
        SCANNER_REGION_ID,
        { fps: 10, qrbox: { width: 250, height: 150 } },
        /* verbose= */ false
      );

      const handleSuccess = (decodedText: string) => {
        onScan(decodedText);
        setIsEnabled(false);
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
      
      const handleError = (error: any) => {
        // We can ignore most scanning errors
      };

      scanner.render(handleSuccess, handleError);

      return () => {
        // Check if scanner is still active before clearing
        if (scanner && scanner.getState() !== 2 /* NOT_STARTED */ ) {
             scanner.clear().catch(e => console.error("Failed to clear scanner on cleanup", e));
        }
      };
    }
  }, [isEnabled, onScan]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {!isEnabled ? (
        <Button onClick={() => setIsEnabled(true)} variant="outline" className="gap-2 h-12 w-full">
          <Camera size={20} /> Use Camera to Scan
        </Button>
      ) : (
        <div className="relative w-full max-w-sm mx-auto">
          <div id={SCANNER_REGION_ID} className="overflow-hidden rounded-lg border-2 border-primary"></div>
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute -top-3 -right-3 rounded-full h-8 w-8 z-10"
            onClick={() => setIsEnabled(false)}
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
