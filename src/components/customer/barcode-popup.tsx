'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Barcode from 'react-barcode';

interface BarcodePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  uid: string;
}

export function BarcodePopup({ open, onOpenChange, userName, uid }: BarcodePopupProps) {
  if (!uid) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{userName}</DialogTitle>
          <DialogDescription>Membership ID: {uid}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-white p-2 rounded-lg">
            <Barcode value={uid} width={0.8} height={30} fontSize={8} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
