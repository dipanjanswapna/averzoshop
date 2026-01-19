'use client';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationComponent } from './pagination';

type ProductGridProps = {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const SKELETON_COUNT = 18;

export const ProductGrid = ({ products, isLoading, currentPage, totalPages, onPageChange }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 mt-2 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-bold">No Products Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or clearing them.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
      )}
    </div>
  );
};
