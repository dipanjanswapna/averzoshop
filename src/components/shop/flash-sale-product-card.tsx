
'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

export const FlashSaleProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const { defaultVariant, displayPrice, displayOriginalPrice, isOutOfStock } = useMemo(() => {
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants ? Object.values(product.variants) : [];

    const determinedVariant = variantsArray.find(v => v.stock > 0) || variantsArray[0];
    const price = determinedVariant?.price ?? product.price;
    const originalPrice = determinedVariant?.compareAtPrice ?? product.compareAtPrice;
    const outOfStock = product.total_stock <= 0;

    return {
      defaultVariant: determinedVariant,
      displayPrice: price,
      displayOriginalPrice: originalPrice,
      isOutOfStock: outOfStock,
    };
  }, [product]);

  const discount = useMemo(() => {
    if (displayOriginalPrice && displayOriginalPrice > displayPrice) {
      return Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);
    }
    return 0;
  }, [displayPrice, displayOriginalPrice]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    addItem(product, defaultVariant);
    toast({ title: 'Added to cart!', description: `${product.name} is in your bag.` });
  };
  
  // Fake sold percentage for UI purposes
  const soldPercentage = 60 + (product.id.charCodeAt(0) % 35);

  return (
    <Link href={`/product/${product.id}`} className="group relative bg-card border-2 border-transparent rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-destructive block">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        {discount > 0 && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground h-10 w-10 flex items-center justify-center rounded-full text-xs font-bold animate-pulse">
                -{discount}%
            </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
             <span className="bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full -rotate-12">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-card text-card-foreground">
        <h3 className="text-xs font-semibold truncate">{product.name}</h3>
        
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-destructive font-roboto">৳{displayPrice.toFixed(2)}</span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-xs text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
          )}
        </div>
        
        <div className="mt-2 space-y-1">
            <Progress value={soldPercentage} className="h-2 bg-red-200 [&>div]:bg-destructive" />
            <p className="text-[10px] text-muted-foreground font-bold">{soldPercentage}% Sold</p>
        </div>

        <Button onClick={handleAddToCart} size="sm" className="w-full mt-2 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-2 rounded-lg text-xs font-bold hover:bg-destructive/90 transition-colors" disabled={isOutOfStock}>
            {isOutOfStock ? 'Sold Out' : <><ShoppingBag size={14} /> Add To Cart</>}
        </Button>
      </div>
    </Link>
  );
};
