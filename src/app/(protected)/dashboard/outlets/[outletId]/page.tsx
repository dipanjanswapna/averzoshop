
'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowLeft, ArrowRightLeft, PackageOpen } from 'lucide-react';
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
        const variantsArray = Array.isArray(p.variants) ? p.variants : Object.values(p.variants || {});
        const stockInOutlet = variantsArray.reduce((sum, v) => sum + (v.outlet_stocks?.[outletId] ?? 0), 0);
        return {
          ...p,
          stock: stockInOutlet,
          vendorName: vendorMap.get(p.vendorId) || 'Unknown Vendor',
        };
      })
      .filter(p => p.stock > 0)
      .sort((a,b) => b.stock - a.stock); // Sort by stock
  }, [productsData, outletId, vendorMap]);

  const handleTransferClick = (product: Product) => {
    setProductToTransfer(product);
    setIsTransferDialogOpen(true);
  }
  
  const renderDesktopSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  const renderMobileSkeleton = () => (
     [...Array(3)].map((_, i) => (
        <Card key={i} className="flex-1 min-w-[300px] max-w-sm">
          <CardHeader className="flex-row items-center gap-4">
             <Skeleton className="h-16 w-16 rounded-md" />
             <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
             </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-5 w-20 ml-auto" />
          </CardContent>
           <CardFooter className="pt-4">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))
  );

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
            {/* Desktop Table */}
            <div className="hidden md:block">
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
                  {isLoading ? renderDesktopSkeleton() : inventory.length > 0 ? (
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
            </div>
             {/* Mobile Cards */}
            <div className="flex flex-wrap justify-center md:hidden gap-4">
              {isLoading ? renderMobileSkeleton() : inventory.length > 0 ? (
                inventory.map(product => (
                  <Card key={product.id} className="flex-1 min-w-[300px] max-w-sm">
                    <CardHeader className="flex-row items-center gap-4">
                       <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                       <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.vendorName}</p>
                       </div>
                    </CardHeader>
                     <CardContent className="pt-4">
                         <p className="text-lg font-bold text-right">{product.stock} <span className="text-sm text-muted-foreground font-normal">units</span></p>
                    </CardContent>
                    <CardFooter className="pt-4">
                       <Button variant="outline" size="sm" onClick={() => handleTransferClick(product)} className="w-full">
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Transfer Stock
                        </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                 <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
                     <PackageOpen className="w-12 h-12 text-muted-foreground" />
                     <h3 className="font-semibold mt-4">No Inventory Found</h3>
                     <p className="text-sm text-muted-foreground">This outlet has no items in stock.</p>
                  </div>
              )}
            </div>
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
