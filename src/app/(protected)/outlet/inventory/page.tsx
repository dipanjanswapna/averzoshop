'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Package, History, Box, CheckCircle, ArrowRightLeft, Truck, Check, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { DeliveryChallan, StockTransfer } from '@/types/logistics';
import type { UserData } from '@/types/user';
import type { Outlet } from '@/types/outlet';
import { ReceiveStockDialog } from '@/components/outlet/receive-stock-dialog';
import { DispatchStockDialog } from '@/components/outlet/dispatch-stock-dialog';
import { ReceiveTransferDialog } from '@/components/outlet/receive-transfer-dialog';
import { StockDetailsDialog } from '@/components/outlet/stock-details-dialog';
import { cn } from '@/lib/utils';


export default function InventoryPage() {
  const { userData } = useAuth();
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: challans, isLoading: challansLoading } = useFirestoreQuery<DeliveryChallan>('delivery_challans');
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');
  const { data: transfers, isLoading: transfersLoading } = useFirestoreQuery<StockTransfer>('stock_transfers');
  const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);

  const [transferToDispatch, setTransferToDispatch] = useState<StockTransfer | null>(null);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [transferToReceive, setTransferToReceive] = useState<StockTransfer | null>(null);
  const [isReceiveTransferDialogOpen, setIsReceiveTransferDialogOpen] = useState(false);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  const isLoading = productsLoading || challansLoading || usersLoading || transfersLoading || outletsLoading;

  const outletId = useMemo(() => userData?.outletId || '', [userData]);
  
  const outletProducts = useMemo(() => {
    if (!products || !outletId) return [];
    return products.map(p => {
        const variantsArray = Array.isArray(p.variants) ? p.variants : Object.values(p.variants || {});
        const stockInOutlet = variantsArray.reduce((sum, v) => sum + (v.outlet_stocks?.[outletId] ?? 0), 0);
        return {
            ...p,
            stockInOutlet
        };
    }).filter(p => p.stockInOutlet > 0);
  }, [products, outletId]);


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

  const handleViewDetailsClick = (product: Product) => {
    setSelectedProductForDetails(product);
    setIsDetailsOpen(true);
  }
  
  const outgoingTransfers = useMemo(() => {
    if (!transfers || !outletId || !allOutlets) return [];
    const outletMap = new Map(allOutlets.map(o => [o.id, o.name]));
    return transfers
        .filter(t => t.sourceOutletId === outletId && t.status === 'requested')
        .map(t => ({ ...t, destinationOutletName: outletMap.get(t.destinationOutletId) || 'Unknown' }))
        .sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [transfers, outletId, allOutlets]);

  const incomingTransfers = useMemo(() => {
      if (!transfers || !outletId || !allOutlets) return [];
      const outletMap = new Map(allOutlets.map(o => [o.id, o.name]));
      return transfers
          .filter(t => t.destinationOutletId === outletId && t.status === 'dispatched')
          .map(t => ({ ...t, sourceOutletName: outletMap.get(t.sourceOutletId) || 'Unknown' }))
          .sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [transfers, outletId, allOutlets]);

  const handleDispatchClick = (transfer: StockTransfer) => {
      setTransferToDispatch(transfer);
      setIsDispatchDialogOpen(true);
  };

  const handleReceiveTransferClick = (transfer: StockTransfer) => {
      setTransferToReceive(transfer);
      setIsReceiveTransferDialogOpen(true);
  };

  const renderDesktopSkeleton = (rows = 5) => (
    [...Array(rows)].map((_, i) => (
       <TableRow key={i}>
            {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
        </TableRow>
    ))
  );
  
   const renderMobileSkeleton = (rows = 3) => (
    [...Array(rows)].map((_, i) => (
        <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
            <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
        </Card>
    ))
  );

  const getProductStatusBadge = (product: Product) => {
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
    let className = '';

    switch (product.status) {
        case 'approved':
            variant = 'secondary';
            className = 'bg-green-500/10 text-green-600';
            break;
        case 'pending':
            variant = 'secondary';
            className = 'bg-orange-500/10 text-orange-600';
            break;
        case 'rejected':
            variant = 'destructive';
            break;
    }
    return <Badge variant={variant} className={cn('capitalize', className)}>{product.status}</Badge>;
  }

  return (
    <>
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Inventory Management</h1>
        <Tabs defaultValue="current_stock">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current_stock"><Box className="mr-2 h-4 w-4" /> Current Stock</TabsTrigger>
                <TabsTrigger value="stock_inward"><History className="mr-2 h-4 w-4" /> Stock Inward</TabsTrigger>
                <TabsTrigger value="stock_transfers"><ArrowRightLeft className="mr-2 h-4 w-4" /> Stock Transfers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current_stock">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Inventory in {userData?.outletId}</CardTitle>
                        <CardDescription>A live view of all products available in your outlet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Stock in Outlet</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {isLoading ? (
                                    renderDesktopSkeleton()
                                ) : outletProducts.length > 0 ? (
                                    outletProducts.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                        <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                        {getProductStatusBadge(product)}
                                        </TableCell>
                                        <TableCell>{product.stockInOutlet}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetailsClick(product)}>
                                                <Eye className="mr-2 h-4 w-4"/>
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No products found in this outlet.</TableCell></TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </div>
                         {/* Mobile Cards */}
                        <div className="grid md:hidden gap-4">
                           {isLoading ? renderMobileSkeleton() : outletProducts.length > 0 ? (
                            outletProducts.map(product => (
                                <Card key={product.id}>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <Image alt={product.name} className="aspect-square rounded-md object-cover" height={64} src={product.image || 'https://placehold.co/64'} width={64} />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm leading-tight">{product.name}</h4>
                                             {getProductStatusBadge(product)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex justify-between items-center">
                                        <p className="text-muted-foreground">Stock:</p>
                                        <p className="text-lg font-bold">{product.stockInOutlet}</p>
                                    </CardContent>
                                    <CardFooter>
                                         <Button variant="outline" size="sm" onClick={() => handleViewDetailsClick(product)} className="w-full">
                                            <Eye className="mr-2 h-4 w-4"/>
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                           ) : (
                             <div className="text-center py-10">No products found in this outlet.</div>
                           )}
                        </div>
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
                        {/* Desktop */}
                       <div className="hidden md:block">
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
                                        renderDesktopSkeleton()
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
                       </div>
                       {/* Mobile */}
                       <div className="grid md:hidden gap-4">
                            {isLoading ? renderMobileSkeleton() : enhancedChallans.length > 0 ? (
                                enhancedChallans.map(challan => (
                                    <Card key={challan.id}>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-mono">{challan.id.substring(0, 8)}...</CardTitle>
                                            <CardDescription>From: {challan.vendorName}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Items:</span>
                                                <span className="font-bold">{challan.totalQuantity}</span>
                                             </div>
                                             <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Date:</span>
                                                <span>{challan.issuedAt.toDate().toLocaleDateString()}</span>
                                             </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button onClick={() => handleReceiveClick(challan)} size="sm" className="w-full">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Receive Stock
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            ): (
                               <div className="text-center py-10">No incoming stock.</div>
                            )}
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="stock_transfers">
                <Tabs defaultValue="incoming">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="incoming">Incoming</TabsTrigger>
                        <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="incoming" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Incoming Stock Transfers</CardTitle>
                                <CardDescription>Accept stock dispatched from other outlets.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Desktop */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>From Outlet</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? renderDesktopSkeleton(3) : incomingTransfers.length > 0 ? (
                                                incomingTransfers.map(t => (
                                                    <TableRow key={t.id}>
                                                        <TableCell>{t.createdAt.toDate().toLocaleDateString()}</TableCell>
                                                        <TableCell>{t.sourceOutletName}</TableCell>
                                                        <TableCell>{t.productName}</TableCell>
                                                        <TableCell>{t.quantity}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button onClick={() => handleReceiveTransferClick(t)} size="sm">
                                                                <Check className="mr-2 h-4 w-4" /> Receive
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No incoming transfers.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {/* Mobile */}
                                <div className="grid md:hidden gap-4">
                                     {isLoading ? renderMobileSkeleton(1) : incomingTransfers.length > 0 ? (
                                         incomingTransfers.map(t => (
                                            <Card key={t.id}>
                                                <CardHeader>
                                                    <CardTitle className="text-base">{t.productName}</CardTitle>
                                                    <CardDescription>From: {t.sourceOutletName}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-bold text-lg">{t.quantity} <span className="text-sm font-normal text-muted-foreground">units</span></p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button onClick={() => handleReceiveTransferClick(t)} size="sm" className="w-full">
                                                        <Check className="mr-2 h-4 w-4" /> Receive
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                         ))
                                     ) : (
                                        <div className="text-center py-10">No incoming transfers.</div>
                                     )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="outgoing" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Outgoing Stock Transfers</CardTitle>
                                <CardDescription>Dispatch stock requested by other outlets or admins.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Desktop */}
                               <div className="hidden md:block">
                                <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>To Outlet</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? renderDesktopSkeleton(3) : outgoingTransfers.length > 0 ? (
                                                outgoingTransfers.map(t => (
                                                    <TableRow key={t.id}>
                                                        <TableCell>{t.createdAt.toDate().toLocaleDateString()}</TableCell>
                                                        <TableCell>{t.destinationOutletName}</TableCell>
                                                        <TableCell>{t.productName}</TableCell>
                                                        <TableCell>{t.quantity}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button onClick={() => handleDispatchClick(t)} size="sm" variant="outline">
                                                                <Truck className="mr-2 h-4 w-4" /> Dispatch
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No outgoing transfer requests.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                               </div>
                               {/* Mobile */}
                               <div className="grid md:hidden gap-4">
                                     {isLoading ? renderMobileSkeleton(1) : outgoingTransfers.length > 0 ? (
                                         outgoingTransfers.map(t => (
                                            <Card key={t.id}>
                                                <CardHeader>
                                                    <CardTitle className="text-base">{t.productName}</CardTitle>
                                                    <CardDescription>To: {t.destinationOutletName}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-bold text-lg">{t.quantity} <span className="text-sm font-normal text-muted-foreground">units</span></p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button onClick={() => handleDispatchClick(t)} size="sm" variant="outline" className="w-full">
                                                        <Truck className="mr-2 h-4 w-4" /> Dispatch
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                         ))
                                     ) : (
                                        <div className="text-center py-10">No outgoing transfer requests.</div>
                                     )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
    </div>
    {selectedChallan && <ReceiveStockDialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen} challan={selectedChallan} />}
    {transferToDispatch && <DispatchStockDialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen} transfer={transferToDispatch} />}
    {transferToReceive && <ReceiveTransferDialog open={isReceiveTransferDialogOpen} onOpenChange={setIsReceiveTransferDialogOpen} transfer={transferToReceive} />}
    {selectedProductForDetails && <StockDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} product={selectedProductForDetails} outletId={outletId} />}
    </>
  );
}
