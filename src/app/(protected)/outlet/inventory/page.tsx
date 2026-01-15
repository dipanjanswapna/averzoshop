'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Package, History, Box, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { DeliveryChallan } from '@/types/logistics';
import type { UserData } from '@/types/user';
import { ReceiveStockDialog } from '@/components/outlet/receive-stock-dialog';

export default function InventoryPage() {
  const { userData } = useAuth();
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: challans, isLoading: challansLoading } = useFirestoreQuery<DeliveryChallan>('delivery_challans');
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');

  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);
  
  const isLoading = productsLoading || challansLoading || usersLoading;

  const outletId = useMemo(() => userData?.outletId || '', [userData]);
  
  const outletProducts = products?.filter(p => p.outlet_stocks && p.outlet_stocks[outletId]) || [];

  const enhancedChallans = useMemo(() => {
    if (!challans || !users || !outletId) return [];

    const userMap = new Map(users.map(u => [u.uid, u.displayName]));
    return challans
      .filter(c => c.outletId === outletId && c.status === 'issued')
      .map(challan => ({
        ...challan,
        vendorName: userMap.get(challan.vendorId) || 'Unknown Vendor',
      }))
      .sort((a, b) => (b.issuedAt?.toDate?.().getTime() || 0) - (a.issuedAt?.toDate?.().getTime() || 0));
  }, [challans, users, outletId]);
  
  const handleReceiveClick = (challan: DeliveryChallan) => {
    setSelectedChallan(challan);
    setIsReceiveDialogOpen(true);
  };


  const renderCurrentStockSkeleton = () => (
    [...Array(5)].map((_, i) => (
       <TableRow key={i}>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
        </TableRow>
    ))
  );

  const renderStockInwardSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-28" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Inventory Management</h1>
        <Tabs defaultValue="current_stock">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current_stock"><Box className="mr-2 h-4 w-4" /> Current Stock</TabsTrigger>
                <TabsTrigger value="stock_inward"><History className="mr-2 h-4 w-4" /> Stock Inward</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current_stock">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Inventory in {userData?.outletId}</CardTitle>
                        <CardDescription>A live view of all products available in your outlet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Stock in Outlet</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoading ? (
                            renderCurrentStockSkeleton()
                        ) : outletProducts.length > 0 ? (
                            outletProducts.map(product => (
                            <TableRow key={product.id}>
                                <TableCell className="hidden sm:table-cell">
                                <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                <Badge variant={
                                    product.status === 'approved' ? 'default' :
                                    product.status === 'pending' ? 'secondary' : 'destructive'
                                } className={`capitalize ${
                                    product.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    product.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {product.status}
                                </Badge>
                                </TableCell>
                                <TableCell>{product.outlet_stocks[userData?.outletId || '']}</TableCell>
                                <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center">No products found in this outlet.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="stock_inward">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Inward (Receive Products)</CardTitle>
                        <CardDescription>Review and receive stock shipments from vendors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Challan ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Date Issued</TableHead>
                                    <TableHead>Total Items</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    renderStockInwardSkeleton()
                                ) : enhancedChallans.length > 0 ? (
                                    enhancedChallans.map(challan => (
                                        <TableRow key={challan.id}>
                                            <TableCell className="font-mono text-xs">{challan.id.substring(0, 8)}...</TableCell>
                                            <TableCell className="font-medium">{challan.vendorName}</TableCell>
                                            <TableCell>{challan.issuedAt.toDate().toLocaleDateString()}</TableCell>
                                            <TableCell>{challan.totalQuantity}</TableCell>
                                            <TableCell className="text-right">
                                                <Button onClick={() => handleReceiveClick(challan)} size="sm">
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Receive Stock
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <Upload className="h-12 w-12 text-muted-foreground" />
                                                <h3 className="mt-4 text-lg font-semibold">No Incoming Stock</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">There are no pending stock shipments to receive.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
    {selectedChallan && <ReceiveStockDialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen} challan={selectedChallan} />}
    </>
  );
}
