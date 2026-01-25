
'use client';

import { useParams } from 'next/navigation';
import { useFirestoreDoc, useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import type { UserData } from '@/types/user';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { ProductGrid } from '@/components/shop/product-grid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Image from 'next/image';

export default function ArtisanStorefrontPage() {
    const params = useParams();
    const { artisanId } = params as { artisanId: string };
    const { firestore } = useFirebase();

    const { data: artisan, isLoading: artisanLoading } = useFirestoreDoc<UserData>(`users/${artisanId}`);
    
    const productsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'products'),
            where('vendorId', '==', artisanId),
            where('status', '==', 'approved')
        );
    }, [firestore, artisanId]);

    const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);

    const isLoading = artisanLoading || productsLoading;
    
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <div className="relative h-48 md:h-64 rounded-xl bg-muted w-full mb-8 flex items-end p-8">
                     <Skeleton className="absolute inset-0" />
                     <div className="relative flex items-end gap-4">
                        <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background" />
                        <div className="space-y-2 pb-4">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                     </div>
                 </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                    {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!artisan || artisan.role !== 'artisan') {
        return <div className="container py-20 text-center">Artisan not found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Artisan Store</BreadcrumbPage></BreadcrumbItem>
                    <BreadcrumbSeparator />
                     <BreadcrumbItem><BreadcrumbPage>{artisan.displayName}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="relative h-48 md:h-64 rounded-xl bg-muted w-full mb-8 flex items-end p-4 md:p-8">
                {artisan.coverPhotoURL && (
                    <Image src={artisan.coverPhotoURL} alt={`${artisan.displayName}'s cover photo`} fill className="object-cover rounded-xl" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-xl"></div>
                <div className="relative flex items-end gap-4">
                     <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background shadow-lg">
                        <AvatarImage src={artisan.photoURL || undefined} alt={artisan.displayName || ''} />
                        <AvatarFallback>{artisan.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <div className="pb-4 text-white">
                        <p className="text-sm font-bold uppercase tracking-widest">Artisan Store</p>
                        <h1 className="text-2xl md:text-4xl font-extrabold font-headline">{artisan.displayName}</h1>
                    </div>
                </div>
            </div>

            {artisan.bio && (
                 <div className="mb-12 max-w-3xl mx-auto text-center">
                    <p className="text-muted-foreground italic">{artisan.bio}</p>
                 </div>
            )}
            
            <ProductGrid 
                products={products || []} 
                isLoading={false}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
            />
        </div>
    )
}
