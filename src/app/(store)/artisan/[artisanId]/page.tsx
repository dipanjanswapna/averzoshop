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
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                         <Skeleton className="h-8 w-48" />
                         <Skeleton className="h-4 w-64" />
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

            <div className="flex items-center gap-6 mb-8 bg-secondary p-8 rounded-xl">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={artisan.photoURL || undefined} alt={artisan.displayName || ''} />
                    <AvatarFallback>{artisan.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Artisan Store</p>
                    <h1 className="text-4xl font-extrabold font-headline">{artisan.displayName}</h1>
                    {/* Maybe add a bio later if it exists on the user model */}
                </div>
            </div>
            
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
