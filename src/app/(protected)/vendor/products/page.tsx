
'use client';
import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order'; // Import Order type
import type { UserData } from '@/types/user';
import { Button } from '@/components/ui/button';
import { PlusCircle, Heart } from 'lucide-react';
import { AddProductDialog } from '@/components/dashboard/add-product-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function VendorProductsPage() {
  const { user } = useAuth();
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: orders, isLoading: ordersLoading } = useFirestoreQuery<Order>('orders'); // Fetch orders
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const isLoading = productsLoading || ordersLoading || usersLoading;

  const preOrderCounts = useMemo(() => {
    if (!orders) return new Map<string, number>();

    const counts = new Map<string, number>();
    orders.forEach(order => {
        if (order.status === 'pre-ordered') {
            order.items.forEach(item => {
                counts.set(item.productId, (counts.get(item.productId) || 0) + item.quantity);
            });
        }
    });
    return counts;
  }, [orders]);
  
  const wishlistedCounts = useMemo(() => {
    if (!users || !products) return new Map<string, number>();

    const counts = new Map<string, number>();
    products.forEach(p => counts.set(p.id, 0)); // Initialize all products with 0

    users.forEach(u => {
      u.wishlist?.forEach(productId => {
        if (counts.has(productId)) {
          counts.set(productId, counts.get(productId)! + 1);
        }
      });
    });

    return counts;
  }, [users, products]);

  const vendorProducts = useMemo(() => {
    if (!products || !user) return [];
    return products
      .filter(p => p.vendorId === user.uid)
      .map(p => ({
        ...p,
        preOrderCount: preOrderCounts.get(p.id) || 0,
        wishlistedCount: wishlistedCounts.get(p.id) || 0,
      }));
  }, [products, user, preOrderCounts, wishlistedCounts]);

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">My Products</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            List New Product
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Product Listings</CardTitle>
            <CardDescription>Manage all products you have listed on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Pre-orders</TableHead>
                  <TableHead>Wishlisted</TableHead>
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
                        } className={`capitalize ${
                          product.status === 'approved' ? 'bg-green-100 text-green-800' :
                          product.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.total_stock}</TableCell>
                      <TableCell>
                        {product.preOrder?.enabled ? (
                            <span className="font-bold">{product.preOrderCount}</span>
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-1 font-bold">
                          <Heart className="h-4 w-4 text-red-400" />
                          {product.wishlistedCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center">No products listed yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
