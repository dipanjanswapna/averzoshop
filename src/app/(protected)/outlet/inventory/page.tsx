'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Package, History } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function InventoryPage() {
  const { userData } = useAuth();
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');
  
  const outletProducts = products?.filter(p => p.outlet_stocks && p.outlet_stocks[userData?.outletId || '']) || [];

  const renderSkeleton = () => (
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

  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Inventory Management</h1>
        <Tabs defaultValue="current_stock">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current_stock"><Package className="mr-2 h-4 w-4" /> Current Stock</TabsTrigger>
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
                            renderSkeleton()
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
                    <CardContent className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Incoming Stock</h3>
                        <p className="mt-1 text-sm text-muted-foreground">There are currently no pending stock shipments to receive.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
