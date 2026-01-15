
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { products, frequentlyBoughtTogether } from '@/lib/data';
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

function ProductPageContent() {
    const params = useParams();
    const { id } = params;

    const product = products.find((p) => p.id === id);

    if (!product) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            </div>
        );
    }
    
    const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10);

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
