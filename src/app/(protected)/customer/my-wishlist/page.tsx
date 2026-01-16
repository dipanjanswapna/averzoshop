
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { WishlistProductCard } from '@/components/shop/wishlist-product-card';
import { Heart, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';

export default function MyWishlistPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { firestore } = useFirebase();

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  
  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);

  const loading = authLoading || productsLoading;

  if (loading) {
    return <div className="container py-20 text-center">Loading wishlist...</div>;
  }

  if (!user) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <User className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Please Log In</h1>
        <p className="text-muted-foreground">You need to be logged in to view your wishlist.</p>
        <Link href="/login">
            <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  const wishlistProducts = allProducts?.filter(p => userData?.wishlist?.includes(p.id)) || [];

  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">My Wishlist</h1>
        <Card>
             <CardHeader>
                <CardTitle>Your Saved Items</CardTitle>
                <CardDescription>All the products you love, in one place.</CardDescription>
            </CardHeader>
            <CardContent>
                 {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {wishlistProducts.map(product => (
                        <WishlistProductCard key={product.id} product={product} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">Looks like you haven't added anything to your wishlist yet. Start exploring and save your favorites!</p>
                        <Link href="/shop">
                            <Button className="mt-6">Explore Products</Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
   
  );
}
