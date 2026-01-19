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
    const fetchRecommendations = async () => {
      if (!user || !allProducts || allProducts.length === 0) return;

      setIsLoadingRecommendations(true);
      try {
        // Only fetch AI recommendations if the user has a wishlist
        if (wishlistProductIds.size > 0) {
            const wishlistProducts = allProducts.filter(p => wishlistProductIds.has(p.id));
            if (wishlistProducts.length === 0) {
                // Fallback if wishlist products are not found in allProducts
                const bestSellers = allProducts.filter(p => p.isBestSeller && p.total_stock > 0).slice(0, 10);
                setRecommendedProducts(bestSellers);
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
                brand: p.brand,
                total_stock: p.total_stock,
            });
            
             const slimWishlistProduct = (p: Product) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                group: p.group,
                subcategory: p.subcategory,
                brand: p.brand,
            });


            const result = await getRecommendedProducts({
                allProductsJson: JSON.stringify(allProducts.filter(p => !wishlistProductIds.has(p.id) && p.total_stock > 0).map(slimProduct)),
                wishlistProductsJson: JSON.stringify(wishlistProducts.map(slimWishlistProduct)),
            });
            
            if (result.recommendedProductIds && result.recommendedProductIds.length > 0) {
                const productMap = new Map(allProducts.map(p => [p.id, p]));
                const recommended = result.recommendedProductIds.map(id => productMap.get(id)).filter((p): p is Product => !!p);
                setRecommendedProducts(recommended);
            } else {
                 // Fallback if AI returns no recommendations
                const bestSellers = allProducts.filter(p => p.isBestSeller && p.total_stock > 0).slice(0, 10);
                setRecommendedProducts(bestSellers);
            }
        } else {
             // Fallback for users without a wishlist: show bestsellers
            const bestSellers = allProducts.filter(p => p.isBestSeller && p.total_stock > 0).slice(0, 10);
            setRecommendedProducts(bestSellers);
        }
      } catch (error) {
        console.error("Failed to get AI recommendations, falling back to bestsellers:", error);
        // Fallback to bestsellers on any API error
        if (allProducts) {
            const bestSellers = allProducts.filter(p => p.isBestSeller && p.total_stock > 0).slice(0, 10);
            setRecommendedProducts(bestSellers);
        }
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [user, allProducts, wishlistProductIds]);
  
  const isLoading = productsLoading || isLoadingRecommendations;

  if (!user) {
      return null; // Don't show the section if user not logged in
  }
  
  // Don't show if there's nothing to show after loading
  if (!isLoading && recommendedProducts.length === 0) {
      return null;
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
                        {wishlistProductIds.size > 0 ? "Just For You" : "Our Bestsellers"}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        {wishlistProductIds.size > 0 ? "Recommendations based on your tastes." : "Check out what's popular right now!"}
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
                    <div className="w-full text-center p-4 col-span-full">
                        <p className="text-muted-foreground">Could not load any products.</p>
                    </div>
                )}
            </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

export default ForYouProducts;
