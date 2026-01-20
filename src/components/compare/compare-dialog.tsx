'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCompare } from '@/hooks/use-compare';
import { CompareTable } from './compare-table';

interface CompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareDialog({ isOpen, onClose }: CompareDialogProps) {
  const { items } = useCompare();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Products</DialogTitle>
          <DialogDescription>
            Here is a side-by-side comparison of the products you selected.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {items.length > 0 ? (
            <CompareTable items={items} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Add products to compare.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
