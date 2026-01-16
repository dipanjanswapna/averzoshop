'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Barcode from 'react-barcode';
import { ShareButtons } from './share-buttons';
import type { Product, ProductVariant } from '@/types/product';

interface BarcodePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  variant: ProductVariant | null;
}

export function BarcodePopup({ open, onOpenChange, product, variant }: BarcodePopupProps) {
  if (!variant) return null;

  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>SKU: {variant.sku}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <Barcode value={variant.sku} width={2} height={80} />
        </div>
        <div className="flex flex-col items-center gap-2 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Share this product</p>
            <ShareButtons url={url} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
