'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types/product';
import { Plus, Equal, ShoppingBag, Loader2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

export function FrequentlyBought({ products }: { products: Product[] }) {
    const { addItem } = useCart();
    const { toast } = useToast();
    const [buttonState, setButtonState] = useState<'idle' | 'adding' | 'added'>('idle');

    if (products.length < 2) return null;
    
    // Only take the first two products for this component
    const productsToDisplay = products.slice(0, 2);
    const totalPrice = productsToDisplay.reduce((acc, p) => acc + p.price, 0);

    const handleAddBothToCart = () => {
        if (buttonState !== 'idle') return;

        setButtonState('adding');

        let itemsAddedCount = 0;

        productsToDisplay.forEach(product => {
            const variantsArray = Array.isArray(product.variants) 
                ? product.variants 
                : product.variants ? Object.values(product.variants) : [];
            const defaultVariant = variantsArray.find(v => (v.stock || 0) > 0) || variantsArray[0];

            if (defaultVariant) {
                addItem(product, defaultVariant, 1);
                itemsAddedCount++;
            } else {
                 toast({
                    variant: 'destructive',
                    title: `Could not add ${product.name}`,
                    description: 'This product seems to have no available variants.',
                });
            }
        });

        if (itemsAddedCount > 0) {
            setTimeout(() => {
                setButtonState('added');
                toast({
                    title: 'Items Added!',
                    description: `${itemsAddedCount} items have been added to your bag.`
                });
                setTimeout(() => {
                    setButtonState('idle');
                }, 1500);
            }, 500);
        } else {
            setButtonState('idle');
        }
    };

    return (
        <div className="bg-secondary p-4 md:p-8 rounded-xl border">
            <h2 className="text-2xl font-bold font-headline mb-6 text-center">Frequently Bought Together</h2>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                <div className="w-full flex-1 min-w-[200px] max-w-[240px]">
                    <ProductCard product={productsToDisplay[0]} />
                </div>
                <div className="text-primary flex-shrink-0">
                    <Plus size={32} />
                </div>
                <div className="w-full flex-1 min-w-[200px] max-w-[240px]">
                    <ProductCard product={productsToDisplay[1]} />
                </div>
                <div className="flex items-center gap-4 text-foreground mt-4 md:mt-0">
                    <Equal size={32} className="hidden md:block" />
                    <div className="text-center w-full md:w-auto">
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-2xl font-bold font-roboto">৳{totalPrice.toFixed(2)}</p>
                        <Button size="sm" className="mt-2 w-full md:w-auto" onClick={handleAddBothToCart} disabled={buttonState !== 'idle'}>
                            {buttonState === 'idle' && <><ShoppingBag size={16} className="mr-2"/> Add Both to Cart</>}
                            {buttonState === 'adding' && <><Loader2 size={16} className="mr-2 animate-spin"/> Adding...</>}
                            {buttonState === 'added' && <><Check size={16} className="mr-2"/> Added!</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
