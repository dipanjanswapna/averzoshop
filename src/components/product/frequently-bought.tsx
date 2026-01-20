'use client';

import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types/product';
import { Plus, Equal } from 'lucide-react';
import { Button } from '../ui/button';

export function FrequentlyBought({ products }: { products: Product[] }) {
    if (products.length < 2) return null;
    
    const totalPrice = products.reduce((acc, p) => acc + p.price, 0);

    return (
        <div className="bg-secondary p-8 rounded-xl border">
            <h2 className="text-2xl font-bold font-headline mb-6 text-center">Frequently Bought Together</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="w-full max-w-[200px]">
                    <ProductCard product={products[0]} />
                </div>
                <div className="text-primary">
                    <Plus size={32} />
                </div>
                <div className="w-full max-w-[200px]">
                    <ProductCard product={products[1]} />
                </div>
                <div className="hidden md:flex items-center gap-4 text-foreground">
                    <Equal size={32} />
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-2xl font-bold font-roboto">৳{totalPrice.toFixed(2)}</p>
                        <Button size="sm" className="mt-2">Add Both to Cart</Button>
                    </div>
                </div>
            </div>
            <div className="md:hidden mt-8 text-center">
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold font-roboto">৳{totalPrice.toFixed(2)}</p>
                <Button className="mt-2 w-full">Add Both to Cart</Button>
            </div>
        </div>
    );
}
