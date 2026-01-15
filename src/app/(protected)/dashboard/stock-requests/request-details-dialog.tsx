
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StockRequest } from '@/types/logistics';

interface RequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: StockRequest;
}

export function RequestDetailsDialog({ open, onOpenChange, request }: RequestDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Items requested for stock transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Product ID</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {request.items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.productId}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
