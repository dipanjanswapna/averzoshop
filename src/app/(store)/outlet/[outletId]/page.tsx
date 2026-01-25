
'use client';

import { useParams } from 'next/navigation';
import { useFirestoreDoc, useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import type { Outlet } from '@/types/outlet';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { ProductGrid } from '@/components/shop/product-grid';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MapPin, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OutletStorefrontPage() {
    const params = useParams();
    const { outletId } = params as { outletId: string };
    const { firestore } = useFirebase();

    const { data: outlet, isLoading: outletLoading } = useFirestoreDoc<Outlet>(`outlets/${outletId}`);
    const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');

    const isLoading = outletLoading || productsLoading;
    
    const outletProducts = useMemo(() => {
        if (!products || !outletId) return [];
        return products.filter(p => {
          const variantsArray = Array.isArray(p.variants) ? p.variants : Object.values(p.variants || {});
          const stockInOutlet = variantsArray.reduce((sum, v) => sum + (v.outlet_stocks?.[outletId] ?? 0), 0);
          return p.status === 'approved' && stockInOutlet > 0;
        });
    }, [products, outletId]);
    
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

    if (!outlet) {
        return <div className="container py-20 text-center">Outlet not found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Outlets</BreadcrumbPage></BreadcrumbItem>
                    <BreadcrumbSeparator />
                     <BreadcrumbItem><BreadcrumbPage>{outlet.name}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-secondary p-8 rounded-xl">
                <div className="bg-background p-4 rounded-xl shadow-md">
                    <Warehouse size={48} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold font-headline">{outlet.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <MapPin size={16} className="text-muted-foreground" />
                        <p className="text-muted-foreground">{outlet.location.address}</p>
                    </div>
                    <Badge className="mt-2">{outlet.status}</Badge>
                </div>
            </div>
            
            <h2 className="text-2xl font-bold font-headline mb-4">Products Available at this Outlet</h2>
            <ProductGrid 
                products={outletProducts || []} 
                isLoading={false}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
            />
        </div>
    )
}
