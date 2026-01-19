'use client';

import Image from 'next/image';
import { ShoppingBag, Zap, Eye } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { WishlistButton } from './ui/wishlist-button';
import { QuickViewDialog } from './shop/QuickViewDialog';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { defaultVariant, displayPrice, displayOriginalPrice, isOutOfStock } = useMemo(() => {
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants ? Object.values(product.variants) : [];

    const determinedVariant = variantsArray.find(v => (v.stock || 0) > 0) || variantsArray[0];
    
    const price = determinedVariant?.price ?? product.price;
    const originalPrice = determinedVariant?.compareAtPrice ?? product.compareAtPrice;

    const outOfStock = !product.preOrder?.enabled && product.total_stock <= 0;

    return {
      defaultVariant: determinedVariant,
      displayPrice: price,
      displayOriginalPrice: originalPrice,
      isOutOfStock: outOfStock,
    };
  }, [product]);

  const isFlashSaleActive = useMemo(() => {
    if (!product.flashSale?.enabled || !product.flashSale.endDate) {
      return false;
    }
    const endDate = product.flashSale.endDate?.toDate ? product.flashSale.endDate.toDate() : new Date(product.flashSale.endDate);
    return endDate > new Date();
  }, [product.flashSale]);

  const variantDiscount = useMemo(() => {
    if (displayOriginalPrice && displayOriginalPrice > displayPrice) {
        return Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);
    }
    return 0;
  }, [displayPrice, displayOriginalPrice]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
        toast({
            variant: "destructive",
            title: 'Out of Stock',
            description: 'This product is currently unavailable.',
        });
        return;
    }

    if (!defaultVariant) {
        toast({
          variant: "destructive",
          title: 'Product Unavailable',
          description: 'This product has no available variants to add.',
        });
        return;
    }

    addItem(product, defaultVariant);
  };

  const handleQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  }

  return (
    <>
      <div className="group relative bg-card border border-transparent hover:border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col text-foreground">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-t-xl">
           <Link href={`/product/${product.id}`} className="block w-full h-full">
            {product.image && (
                <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            )}
           </Link>
          
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {variantDiscount > 0 && !isOutOfStock && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full">{variantDiscount}% OFF</span>
            )}
            {isFlashSaleActive && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1"><Zap size={12} /> SALE</span>
            )}
             {product.preOrder?.enabled && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Pre-order</span>
            )}
          </div>

          <WishlistButton
              productId={product.id}
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 bg-card/60 backdrop-blur-sm rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8 z-10 transition-all scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
            />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center pointer-events-none">
              <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full -rotate-6 border">OUT OF STOCK</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <Button className="w-full h-9 text-xs font-bold" onClick={handleAddToCart} disabled={isOutOfStock}>
              <ShoppingBag size={16} className="mr-2"/>
              {product.preOrder?.enabled ? 'Pre-order' : 'Add to Bag'}
            </Button>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <Link href={`/product/${product.id}`} className="flex-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{product.brand}</span>
            <h3 className="text-sm font-bold leading-tight mt-1" title={product.name}>
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-end justify-between gap-2 mt-2">
            <div className="flex flex-col">
              <span className="text-base font-bold text-primary">৳{displayPrice.toFixed(2)}</span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-xs text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
              )}
            </div>
            <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-primary"
                onClick={handleQuickView}
                title="Quick View"
              >
                <Eye size={16} />
            </Button>
          </div>
        </div>
      </div>
      <QuickViewDialog product={product} open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen} />
    </>
  );
};
