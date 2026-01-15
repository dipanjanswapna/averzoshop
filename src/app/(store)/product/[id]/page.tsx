
'use client';

import { Suspense, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductDetails } from '@/components/product/product-details';
import { ProductTabs } from '@/components/product/product-tabs';
import { RelatedProducts } from '@/components/product/related-products';
import { MobileActionbar } from '@/components/product/mobile-action-bar';
import { FrequentlyBought } from '@/components/product/frequently-bought';
import { Skeleton } from '@/components/ui/skeleton';

function ProductPageContent() {
    const params = useParams();
    const { id } = params;
    const { data: products, isLoading } = useFirestoreQuery<Product>('products');

    const { product, relatedProducts, frequentlyBoughtTogether } = useMemo(() => {
        if (!products) return { product: null, relatedProducts: [], frequentlyBoughtTogether: [] };
        
        const currentProduct = products.find((p) => p.id === id);
        
        if (!currentProduct) return { product: null, relatedProducts: [], frequentlyBoughtTogether: [] };

        const related = products.filter(p => p.status === 'approved' && p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 10);
        const frequentlyBought = products.filter(p => p.status === 'approved' && p.isBestSeller && p.id !== currentProduct.id).slice(0, 2);

        return { product: currentProduct, relatedProducts: related, frequentlyBoughtTogether: frequentlyBought };
    }, [products, id]);
    
    if (isLoading) {
        return (
            <div className="container py-8">
                <Skeleton className="h-6 w-1/2 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="bg-background">
            <div className="container py-8">
                 <Breadcrumb className="mb-6 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/shop?mother_category=${encodeURIComponent(product.category)}`}>{product.category}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                         {product.group && (
                           <>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/shop?mother_category=${encodeURIComponent(product.category)}&group=${encodeURIComponent(product.group)}`}>{product.group}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                           </>
                        )}
                        <BreadcrumbItem>
                            <BreadcrumbPage className="max-w-48 truncate">{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ProductImageGallery product={product} />
                    <ProductDetails product={product} />
                </div>
            </div>
            
            <div className="container py-12">
                <FrequentlyBought products={frequentlyBoughtTogether} />
            </div>

            <div className="container py-12">
                <ProductTabs product={product} />
            </div>

            <div className="container py-12">
                <RelatedProducts products={relatedProducts} />
            </div>

            <MobileActionbar product={product} />
        </div>
    );
}


export default function ProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductPageContent />
        </Suspense>
    )
}
