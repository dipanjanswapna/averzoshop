'use client';

import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types/product';
import { Plus, Equal } from 'lucide-react';
import { Button } from '../ui/button';

export function FrequentlyBought({ products }: { products: Product[] }) {
    if (products.length < 2) return null;
    
    const totalPrice = products.reduce((acc, p) => acc + p.price, 0);

    return (
        <div className="bg-secondary p-4 md:p-8 rounded-xl border">
            <h2 className="text-2xl font-bold font-headline mb-6 text-center">Frequently Bought Together</h2>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                <div className="w-full flex-1 min-w-[200px] max-w-[240px]">
                    <ProductCard product={products[0]} />
                </div>
                <div className="text-primary flex-shrink-0">
                    <Plus size={32} />
                </div>
                <div className="w-full flex-1 min-w-[200px] max-w-[240px]">
                    <ProductCard product={products[1]} />
                </div>
                <div className="flex items-center gap-4 text-foreground mt-4 md:mt-0">
                    <Equal size={32} className="hidden md:block" />
                    <div className="text-center w-full md:w-auto">
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-2xl font-bold font-roboto">৳{totalPrice.toFixed(2)}</p>
                        <Button size="sm" className="mt-2 w-full md:w-auto">Add Both to Cart</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
