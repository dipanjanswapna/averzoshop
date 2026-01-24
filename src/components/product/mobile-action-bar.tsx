'use client';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/product';
import { NotifyMeButton } from './notify-me-button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function MobileActionbar({ product, selectedVariant, isOutOfStock }: { product: Product; selectedVariant: ProductVariant | null; isOutOfStock: boolean; }) {
    const [buttonState, setButtonState] = useState<'idle' | 'adding' | 'added'>('idle');
    const { addItem } = useCart();
    const { toast } = useToast();

    const handleAddToCart = () => {
        if (buttonState !== 'idle') return;
        if (!selectedVariant) {
          toast({ variant: 'destructive', title: 'Unavailable', description: 'Please select from available options.' });
          return;
        }
        setButtonState('adding');
        addItem(product, selectedVariant, 1);
        setTimeout(() => {
            setButtonState('added');
            setTimeout(() => {
                setButtonState('idle');
            }, 1500);
        }, 500);
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
             {isOutOfStock && !product.preOrder?.enabled ? (
                <NotifyMeButton productId={product.id} productName={product.name} />
            ) : (
                <div className="flex items-center gap-3">
                    <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={buttonState !== 'idle'}>
                        {buttonState === 'idle' && <><ShoppingBag size={20} className="mr-2" /> Add to Bag</>}
                        {buttonState === 'adding' && <Loader2 size={20} className="mr-2 animate-spin"/>}
                        {buttonState === 'added' && <><Check size={20} className="mr-2"/> Added</>}
                    </Button>
                    <Button size="lg" className="w-full">Buy Now</Button>
                </div>
            )}
        </div>
    );
}
