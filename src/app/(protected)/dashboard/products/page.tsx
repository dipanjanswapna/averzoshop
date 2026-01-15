
'use client';
import { useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { AddProductDialog } from '@/components/dashboard/add-product-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ProductsPage() {
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { userData } = useAuth();

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
         <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );
  
  if (userData?.role !== 'admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-destructive">You do not have permission to view this page.</p>
        </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Product Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>View, manage, and approve all products in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : 
                  products && products.length > 0 ? products.map((product) => (
                    <TableRow key={product.id}>
                       <TableCell className="hidden sm:table-cell">
                          <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{product.vendorId}</TableCell>
                         <TableCell>
                           <Badge variant={
                            product.status === 'approved' ? 'default' :
                            product.status === 'pending' ? 'secondary' : 'destructive'
                          } className={`capitalize ${
                            product.status === 'approved' ? 'bg-green-100 text-green-800' :
                            product.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {product.status === 'pending' && (
                                    <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                                )}
                               <DropdownMenuItem>Edit</DropdownMenuItem>
                               <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={7} className="h-24 text-center">No products found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
