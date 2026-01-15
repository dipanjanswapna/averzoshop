
'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';
import type { Product } from '@/types/product';
import { Skeleton } from '../ui/skeleton';
import { MapPin, Store } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface StoreAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function StoreAvailabilityDialog({ open, onOpenChange, product }: StoreAvailabilityDialogProps) {
  const { data: allOutlets, isLoading } = useFirestoreQuery<Outlet>('outlets');

  const outletsWithStock = useMemo(() => {
    if (!allOutlets || !product.outlet_stocks) return [];
    return allOutlets
      .filter(outlet => (product.outlet_stocks[outlet.id] ?? 0) > 0)
      .map(outlet => ({
        ...outlet,
        stock: product.outlet_stocks[outlet.id]
      }));
  }, [allOutlets, product.outlet_stocks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Store Availability</DialogTitle>
          <DialogDescription>
            Check where you can find "{product.name}" in-store.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-6">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 border p-4 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                   <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))
            ) : outletsWithStock.length > 0 ? (
              outletsWithStock.map(outlet => (
                <div key={outlet.id} className="flex items-start gap-4 border p-4 rounded-lg">
                  <div className="bg-muted p-2 rounded-md mt-1">
                    <Store className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{outlet.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin size={12} />
                      <span>{outlet.location.address}</span>
                    </div>
                  </div>
                  <Badge variant={outlet.stock > 10 ? 'default' : 'secondary'} className={outlet.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {outlet.stock} units
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>This product is currently not available in any of our physical stores.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
