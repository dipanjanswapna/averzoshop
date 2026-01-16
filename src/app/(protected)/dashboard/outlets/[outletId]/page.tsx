'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransferStockDialog } from '@/components/dashboard/transfer-stock-dialog';

import type { Outlet } from '@/types/outlet';
import type { Product } from '@/types/product';
import type { UserData } from '@/types/user';

export default function OutletDetailsPage() {
  const params = useParams();
  const outletId = params.outletId as string;

  const { data: outletsData, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');
  const { data: productsData, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: usersData, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');

  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [productToTransfer, setProductToTransfer] = useState<Product | null>(null);

  const isLoading = outletsLoading || productsLoading || usersLoading;

  const outlet = useMemo(() => {
    return outletsData?.find(o => o.id === outletId);
  }, [outletsData, outletId]);

  const vendorMap = useMemo(() => {
    if (!usersData) return new Map();
    return new Map(usersData.filter(u => u.role === 'vendor').map(v => [v.uid, v.displayName]));
  }, [usersData]);

  const inventory = useMemo(() => {
    if (!productsData || !outletId) return [];
    return productsData
      .map(p => {
        const stockInOutlet = p.variants.reduce((sum, v) => sum + (v.outlet_stocks?.[outletId] ?? 0), 0);
        return {
          ...p,
          stock: stockInOutlet,
          vendorName: vendorMap.get(p.vendorId) || 'Unknown Vendor',
        };
      })
      .filter(p => p.stock > 0);
  }, [productsData, outletId, vendorMap]);

  const handleTransferClick = (product: Product) => {
    setProductToTransfer(product);
    setIsTransferDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!outlet) {
    return (
      <div>
        <Link href="/dashboard/outlets">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Outlets</Button>
        </Link>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Outlet Not Found</h1>
          <p className="text-muted-foreground">The requested outlet could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/outlets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-headline">{outlet.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Outlet Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p>{outlet.location.address}</p>
            </div>
            <div className="mt-2">
              <Badge variant={outlet.status === 'Active' ? 'default' : 'secondary'} className={outlet.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {outlet.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Live stock count for products available in this outlet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length > 0 ? (
                  inventory.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image || 'https://placehold.co/64'}
                          width="64"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{product.baseSku}</div>
                      </TableCell>
                      <TableCell>{product.vendorName}</TableCell>
                      <TableCell className="text-right font-bold">{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleTransferClick(product)}>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Transfer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No inventory found for this outlet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {productToTransfer && (
        <TransferStockDialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          product={productToTransfer}
          sourceOutletId={outletId}
        />
      )}
    </>
  );
}
