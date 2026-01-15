
'use client';
import { useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { AddProductDialog } from '@/components/dashboard/add-product-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const { data: products, isLoading } = useFirestoreQuery<Product>('products');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const renderSkeleton = () => (
    [...Array(6)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Products</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? renderSkeleton() : 
            products && products.length > 0 ? products.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : <p>No products found.</p>}
        </div>
      </div>
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
