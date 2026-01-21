
'use client';
import { useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, PackageOpen } from 'lucide-react';
import { AddProductDialog } from '@/components/dashboard/add-product-dialog';
import { EditProductDialog } from '@/components/dashboard/edit-product-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { userData } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleStatusChange = async (productId: string, newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    const productRef = doc(firestore, 'products', productId);
    try {
      await updateDoc(productRef, { status: newStatus });
      toast({
        title: 'Product status updated',
        description: `Product has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update product status.',
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };


  const renderDesktopSkeleton = () => (
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

  const renderMobileSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </CardContent>
      </Card>
    ))
  );
  
  if (userData?.role !== 'admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-destructive">You do not have permission to view this page.</p>
        </div>
    )
  }

  const renderProductStatusBadge = (product: Product) => {
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
    let className = '';

    switch (product.status) {
        case 'approved':
            variant = 'default';
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
  };

  const renderActionsDropdown = (product: Product) => (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {product.status === 'pending' && (
                <>
                    <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'approved')} className="text-green-600 focus:text-green-700">Approve</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'rejected')} className="text-destructive focus:text-destructive">Reject</DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            )}
           <DropdownMenuItem onClick={() => handleEditClick(product)}>Edit</DropdownMenuItem>
           <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );

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
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? renderDesktopSkeleton() : 
                    products && products.length > 0 ? products.map((product) => (
                      <TableRow key={product.id}>
                         <TableCell className="hidden sm:table-cell">
                            <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{product.vendorId}</TableCell>
                           <TableCell>
                            {renderProductStatusBadge(product)}
                          </TableCell>
                          <TableCell>{product.total_stock}</TableCell>
                          <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {renderActionsDropdown(product)}
                          </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={7} className="h-24 text-center">No products found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile View */}
            <div className="grid md:hidden gap-4">
              {isLoading ? renderMobileSkeleton() :
                products && products.length > 0 ? products.map((product) => (
                  <Card key={product.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-4 p-4">
                       <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                       <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-sm leading-tight">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">Vendor: {product.vendorId}</p>
                          <p className="font-bold text-primary pt-1">৳{product.price.toFixed(2)}</p>
                       </div>
                       <div>
                          {renderActionsDropdown(product)}
                       </div>
                    </CardHeader>
                     <CardContent className="p-4 pt-0 flex items-center justify-between text-sm">
                        {renderProductStatusBadge(product)}
                        <span className="text-muted-foreground">Stock: <span className="font-bold text-foreground">{product.total_stock}</span></span>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
                     <PackageOpen className="w-12 h-12 text-muted-foreground" />
                     <h3 className="font-semibold mt-4">No Products Found</h3>
                     <p className="text-sm text-muted-foreground">Get started by adding a new product.</p>
                  </div>
                )}
            </div>

          </CardContent>
        </Card>
      </div>
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      {selectedProduct && <EditProductDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} product={selectedProduct} />}
    </>
  );
}
