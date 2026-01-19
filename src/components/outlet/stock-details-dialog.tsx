'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product } from '@/types/product';

interface StockDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  outletId: string;
}

export function StockDetailsDialog({ open, onOpenChange, product, outletId }: StockDetailsDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Stock Details: {product.name}</DialogTitle>
          <DialogDescription>
            Live stock count for each variant in this outlet.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {product.variants.map((variant) => (
                        <TableRow key={variant.sku}>
                            <TableCell className="font-medium">
                                {variant.color || ''} {variant.size ? `(${variant.size})` : ''}
                                {!variant.color && !variant.size && "Standard"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                            <TableCell className="text-right font-bold">
                                {variant.outlet_stocks?.[outletId] ?? 0}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
