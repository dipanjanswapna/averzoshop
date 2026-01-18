
'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { UserData } from '@/types/user';
import type { Product } from '@/types/product';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

function PublicWishlistPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const wishlistId = searchParams.get('wishlistId');
  const { user: currentUser } = useAuth(); // Logged-in user

  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');
  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');

  const isLoading = usersLoading || productsLoading;

  const { owner, wishlist } = useMemo(() => {
    if (!users || !userId || !wishlistId) return { owner: null, wishlist: null };
    const listOwner = users.find(u => u.uid === userId);
    if (!listOwner) return { owner: null, wishlist: null };

    const foundWishlist = listOwner.wishlists?.find(w => w.id === wishlistId);
    return { owner: listOwner, wishlist: foundWishlist };
  }, [users, userId, wishlistId]);

  const wishlistProducts = useMemo(() => {
    if (!wishlist || !allProducts) return [];
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    return wishlist.items
        .map(item => ({ item, product: productMap.get(item.productId) }))
        .filter(data => data.product) as { item: any, product: Product }[];
  }, [wishlist, allProducts]);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center gap-4 mb-8">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
        </div>
    )
  }

  if (!owner || !wishlist) {
      return (
          <div className="container mx-auto py-16 text-center">
              <AlertTriangle className="mx-auto h-24 w-24 text-muted-foreground" />
              <h1 className="mt-6 text-3xl font-extrabold font-headline">Wishlist Not Found</h1>
              <p className="mt-2 text-muted-foreground">The requested wishlist does not exist or the link is invalid.</p>
          </div>
      )
  }
  
  if (!wishlist.isPublic && currentUser?.uid !== owner.uid) {
      return (
           <div className="container mx-auto py-16 text-center">
              <Lock className="mx-auto h-24 w-24 text-muted-foreground" />
              <h1 className="mt-6 text-3xl font-extrabold font-headline">This Wishlist is Private</h1>
              <p className="mt-2 text-muted-foreground">The owner has not made this wishlist public.</p>
          </div>
      )
  }


  return (
    <div className="bg-secondary min-h-screen py-12">
        <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-10">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-lg">
                    <AvatarImage src={owner.photoURL || undefined} alt={owner.displayName || ''} />
                    <AvatarFallback>{owner.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-extrabold font-headline">{owner.displayName}'s Wishlist</h1>
                <p className="text-xl font-bold text-primary mt-1">{wishlist.name}</p>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistProducts.map(({item, product}) => (
                    <Card key={item.productId} className="overflow-hidden">
                        <Link href={`/product/${product.id}`}>
                            <div className="relative aspect-square">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                        </Link>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-sm h-10 line-clamp-2">{product.name}</h3>
                            <p className="text-lg font-bold text-primary mt-2">৳{product.price.toFixed(2)}</p>
                            {item.notes && <p className="text-xs text-muted-foreground mt-1 border-l-2 pl-2 italic">"{item.notes}"</p>}
                             <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                             <Link href={`/product/${product.id}`} className="w-full block">
                                <Button className="w-full mt-3" variant="outline">View Product</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

             {wishlistProducts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">This wishlist is currently empty.</p>
                </div>
            )}
        </div>
    </div>
  );
}


export default function PublicWishlistPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Wishlist...</div>}>
            <PublicWishlistPageContent />
        </Suspense>
    )
}
