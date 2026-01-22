'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';
import type { Product, ProductVariant } from '@/types/product';
import { Skeleton } from '../ui/skeleton';
import { MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { calculateDistance } from '@/lib/distance';


interface StoreAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

const getVariantsAsArray = (variants: any): ProductVariant[] => {
    if (!variants) return [];
    if (Array.isArray(variants)) {
        return variants;
    }
    if (typeof variants === 'object') {
        return Object.values(variants);
    }
    return [];
};


export function StoreAvailabilityDialog({ open, onOpenChange, product }: StoreAvailabilityDialogProps) {
  const { firestore } = useFirebase();
  const { userData } = useAuth();

  const outletsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'outlets'));
  }, [firestore]);
  
  const { data: allOutlets, isLoading } = useFirestoreQuery<Outlet>(outletsQuery);

  const outletsWithStock = useMemo(() => {
    if (!allOutlets || !product) return [];

    const variants = getVariantsAsArray(product.variants);
    const customerCoords = userData?.addresses?.[0]?.coordinates;

    return allOutlets
      .map(outlet => {
        const variantsInStock = variants
          .map(variant => ({
            ...variant,
            stockInOutlet: variant.outlet_stocks?.[outlet.id] ?? 0,
          }))
          .filter(variant => variant.stockInOutlet > 0);
        
        const totalStockInOutlet = variantsInStock.reduce((sum, variant) => sum + variant.stockInOutlet, 0);

        let distance: number | null = null;
        if (customerCoords?.lat && customerCoords?.lng && outlet.location.lat && outlet.location.lng) {
          distance = calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng);
        }

        return {
          ...outlet,
          totalStock: totalStockInOutlet,
          variants: variantsInStock,
          distance,
        };
      })
      .filter(outlet => outlet.totalStock > 0)
      .sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

  }, [allOutlets, product, userData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Store Availability</DialogTitle>
          <DialogDescription>
            Check where you can find "{product.name}" in-store.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : outletsWithStock.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {outletsWithStock.map(outlet => (
                  <AccordionItem value={outlet.id} key={outlet.id}>
                    <AccordionTrigger>
                      <div className="flex-1 text-left">
                        <p className="font-bold">{outlet.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin size={12} />
                          <span>{outlet.location.address}</span>
                          {outlet.distance !== null && (
                            <span className="font-semibold text-primary ml-2">(~{outlet.distance.toFixed(1)} km away)</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={outlet.totalStock > 10 ? 'default' : 'secondary'} className={`ml-4 ${outlet.totalStock > 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {outlet.totalStock} units
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {outlet.variants.map((variant) => (
                            <TableRow key={variant.sku}>
                              <TableCell className="font-medium">
                                {variant.color || ''} {variant.size ? `(${variant.size})` : ''}
                                {!variant.color && !variant.size && "Standard"}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                              <TableCell className="text-right font-bold">
                                {variant.stockInOutlet}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
