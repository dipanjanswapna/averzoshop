'use client';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { useMemo, useState, useEffect } from 'react';
import { getRecommendedProducts } from '@/ai/flows/product-recommender';
import { ProductCard } from './product-card';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

const ForYouProducts = () => {
  const { user, userData } = useAuth();
  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const wishlistProductIds = useMemo(() => new Set(userData?.wishlist || []), [userData]);

  useEffect(() => {
    if (user && allProducts && allProducts.length > 0 && wishlistProductIds.size > 0) {
      const fetchRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
          const wishlistProducts = allProducts.filter(p => wishlistProductIds.has(p.id));
          if (wishlistProducts.length === 0) {
              setIsLoadingRecommendations(false);
              return;
          }

          // To reduce payload size, only send essential fields to the AI
          const slimProduct = (p: Product) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            group: p.group,
            subcategory: p.subcategory,
            description: p.description,
            brand: p.brand
          });

          const result = await getRecommendedProducts({
            allProductsJson: JSON.stringify(allProducts.filter(p => !wishlistProductIds.has(p.id)).map(slimProduct)),
            wishlistProductsJson: JSON.stringify(wishlistProducts.map(slimProduct)),
          });
          
          if (result.recommendedProductIds) {
            const productMap = new Map(allProducts.map(p => [p.id, p]));
            const recommended = result.recommendedProductIds.map(id => productMap.get(id)).filter((p): p is Product => !!p);
            setRecommendedProducts(recommended);
          }
        } catch (error) {
          console.error("Failed to get recommendations:", error);
          // Fallback might be needed here, e.g., show bestsellers
        } finally {
          setIsLoadingRecommendations(false);
        }
      };

      fetchRecommendations();
    }
  }, [user, allProducts, wishlistProductIds]);
  
  const isLoading = productsLoading || isLoadingRecommendations;

  if (!user || wishlistProductIds.size === 0) {
      return null; // Don't show the section if user not logged in or wishlist is empty
  }

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <Carousel 
            opts={{
                align: "start",
            }}
            className="w-full"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="font-headline text-3xl font-extrabold">
                        Just For You
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Recommendations based on your tastes.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CarouselPrevious className="static -translate-y-0" />
                    <CarouselNext className="static -translate-y-0" />
                </div>
            </div>
            <CarouselContent className="-ml-2">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <CarouselItem key={i} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
                            <div className="space-y-2">
                                <Skeleton className="aspect-square w-full rounded-xl" />
                                <Skeleton className="h-4 mt-2 w-3/4" />
                                <Skeleton className="h-5 w-1/2" />
                            </div>
                        </CarouselItem>
                    ))
                ) : recommendedProducts.length > 0 ? (
                    recommendedProducts.map(product => (
                        <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))
                ) : (
                    // Fallback content if no recommendations, e.g., show bestsellers
                    // For now, showing a message.
                    <p className="p-4 text-muted-foreground">No recommendations available right now. Add items to your wishlist!</p>
                )}
            </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

export default ForYouProducts;
