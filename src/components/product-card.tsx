
'use client';

import Image from 'next/image';
import { ShoppingBag, Zap, Eye, Gift } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { WishlistButton } from './ui/wishlist-button';
import { QuickViewDialog } from './shop/QuickViewDialog';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { CompareButton } from './ui/compare-button';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { defaultVariant, displayPrice, displayOriginalPrice, isOutOfStock, stockPercentage, isLowStock } = useMemo(() => {
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants ? Object.values(product.variants) : [];

    const determinedVariant = variantsArray.find(v => (v.stock || 0) > 0) || variantsArray[0];
    
    const price = determinedVariant?.price ?? product.price;
    const originalPrice = determinedVariant?.compareAtPrice ?? product.compareAtPrice;
    
    const outOfStock = !product.preOrder?.enabled && product.total_stock <= 0;
    
    const stock = product.total_stock || 0;
    const lowStockThreshold = 20;
    const lowStock = !outOfStock && stock > 0 && stock < lowStockThreshold;
    const percentage = lowStock ? (stock / lowStockThreshold) * 100 : 0;

    return {
      defaultVariant: determinedVariant,
      displayPrice: price,
      displayOriginalPrice: originalPrice,
      isOutOfStock: outOfStock,
      stockPercentage: percentage,
      isLowStock: lowStock,
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
        toast({ variant: "destructive", title: 'Out of Stock' });
        return;
    }
    if (!defaultVariant) {
        toast({ variant: "destructive", title: 'Product Unavailable' });
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
      <div className="group relative bg-card border border-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col text-foreground">
        <div className="relative aspect-square overflow-hidden bg-muted rounded-t-xl">
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
          
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
            {variantDiscount > 0 && !isOutOfStock && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{variantDiscount}% OFF</span>
            )}
            {isFlashSaleActive && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1"><Zap size={12} /> SALE</span>
            )}
            {product.preOrder?.enabled && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pre-order</span>
            )}
            {product.giftWithPurchase?.enabled && (
                <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><Gift size={12} /> Gift</span>
            )}
             {product.isNew && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
            )}
             {product.isBestSeller && (
              <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best Seller</span>
            )}
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <WishlistButton
              productId={product.id}
              variant="secondary"
              size="icon"
              className="bg-card/60 backdrop-blur-sm rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8"
            />
             <CompareButton
              product={product}
              variant="secondary"
              size="icon"
              className="bg-card/60 backdrop-blur-sm rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8"
            />
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center pointer-events-none z-10">
              <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full -rotate-6 border">OUT OF STOCK</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <Button className="w-full h-9 text-xs font-bold bg-background/70 text-foreground backdrop-blur-md hover:bg-background/90" onClick={handleQuickView}>
              <Eye size={16} className="mr-2"/>
              Quick View
            </Button>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <Link href={`/product/${product.id}`} className="flex-1">
            <h3 className="text-sm font-semibold leading-snug mt-1" title={product.name}>
              {product.name}
            </h3>
          </Link>
          
          <div className="mt-2">
             <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary">৳{displayPrice.toFixed(2)}</span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-xs text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
              )}
            </div>
             {isLowStock && (
                 <div className="mt-2 space-y-1">
                     <div className="flex justify-between items-center text-[10px] font-bold text-destructive">
                        <span>Low Stock!</span>
                        <span>{product.total_stock} left</span>
                     </div>
                     <Progress value={stockPercentage} className="h-1 bg-destructive/20 [&>div]:bg-destructive" />
                 </div>
            )}
          </div>

          <Button className="w-full h-9 text-xs font-bold mt-3" onClick={handleAddToCart} disabled={isOutOfStock}>
            <ShoppingBag size={16} className="mr-2"/>
            {product.preOrder?.enabled ? 'Pre-order' : 'Add to Bag'}
          </Button>
        </div>
      </div>
      <QuickViewDialog product={product} open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen} />
    </>
  );
};
