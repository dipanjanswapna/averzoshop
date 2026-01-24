'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useCompare } from '@/hooks/use-compare';
import { CompareTable } from './compare-table';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface CompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareDialog({ isOpen, onClose }: CompareDialogProps) {
  const { items, clearCompare } = useCompare();

  const handleClearAndClose = () => {
    clearCompare();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Compare Products ({items.length})</DialogTitle>
          <DialogDescription>
            Here is a side-by-side comparison of the products you selected.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-6 pt-2">
            {items.length > 0 ? (
              <CompareTable items={items} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Add products to compare.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 border-t bg-muted/50">
            <Button variant="destructive" onClick={handleClearAndClose}>Clear All & Close</Button>
            <DialogClose asChild>
                <Button>Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
