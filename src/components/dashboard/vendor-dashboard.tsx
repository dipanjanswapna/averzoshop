
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, BarChart2, Package, History } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { AddProductDialog } from './add-product-dialog';
import { Skeleton } from '../ui/skeleton';

export function VendorDashboard() {
  const { user } = useAuth();
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const vendorProducts = products?.filter(p => p.vendorId === user?.uid) || [];

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
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
    <div className="space-y-6">
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" /> My Products</TabsTrigger>
          <TabsTrigger value="inventory"><History className="mr-2 h-4 w-4" /> Stock Requests</TabsTrigger>
          <TabsTrigger value="outlets"><BarChart2 className="mr-2 h-4 w-4" /> Outlet Performance</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart2 className="mr-2 h-4 w-4" /> Sales Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Products</CardTitle>
                  <CardDescription>Manage all products you have listed.</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> List New Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    renderSkeleton()
                  ) : vendorProducts.length > 0 ? (
                    vendorProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            product.status === 'approved' ? 'default' :
                            product.status === 'pending' ? 'secondary' : 'destructive'
                          } className="capitalize">
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No products listed yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
           <Card>
            <CardHeader>
              <CardTitle>Inventory Requests</CardTitle>
              <CardDescription>Request to add new stock to outlets.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">This feature is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outlets">
           <Card>
            <CardHeader>
              <CardTitle>Outlet Performance</CardTitle>
              <CardDescription>See how your products are performing in different outlets.</CardDescription>
            </CardHeader>
             <CardContent className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                <BarChart2 className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">This feature is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Review your sales and earnings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                <BarChart2 className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">This feature is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
