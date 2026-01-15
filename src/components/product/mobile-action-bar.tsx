
'use client';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import type { products } from '@/lib/data';

type Product = (typeof products)[0];

export function MobileActionbar({ product }: { product: Product }) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="flex items-center gap-3">
                <Button size="lg" variant="outline" className="w-full">
                    <ShoppingBag size={20} className="mr-2" /> Add to Bag
                </Button>
                <Button size="lg" className="w-full">Buy Now</Button>
            </div>
        </div>
    );
}
