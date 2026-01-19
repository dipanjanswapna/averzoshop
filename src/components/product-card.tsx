'use client';

import Image from 'next/image';
import { ShoppingBag, Layers, Gift, Zap, Eye, Star } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { useCompare } from '@/hooks/use-compare';
import { WishlistButton } from './ui/wishlist-button';
import { Progress } from './ui/progress';
import { QuickViewDialog } from './shop/QuickViewDialog';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { items: compareItems, addItem: addCompareItem, removeItem: removeCompareItem } = useCompare();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const isComparing = useMemo(() => compareItems.some(item => item.id === product.id), [compareItems, product.id]);

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
  
  const isLowStock = !isOutOfStock && !product.preOrder?.enabled && product.total_stock > 0 && product.total_stock < 20;

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
  
  const handleCompareToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isComparing) {
      removeCompareItem(product.id);
      toast({ title: 'Removed from Compare' });
    } else {
      const success = addCompareItem(product);
      if (success) {
        toast({ title: 'Added to Compare' });
      }
    }
  };

  const handleQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  }

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants);
    return [...new Set(variantsArray.map(v => v.color).filter(Boolean))];
  }, [product]);

  return (
    <>
      <div className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col text-foreground">
        <div className="relative aspect-square overflow-hidden bg-muted">
           <Link href={`/product/${product.id}`} className="block w-full h-full">
            {product.image && (
                <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            )}
           </Link>
          
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isFlashSaleActive && (
              <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1"><Zap size={10} /> FLASH SALE</span>
            )}
            {variantDiscount > 0 && !isOutOfStock && (
              <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">{variantDiscount}% OFF</span>
            )}
            {product.isNew && <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>}
            {product.isBestSeller && <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">BEST SELLER</span>}
            {product.preOrder?.enabled && (
              <span className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Pre-order</span>
            )}
            {product.giftWithPurchase?.enabled && (
              <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Gift size={10} /> GIFT
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center pointer-events-none">
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full -rotate-12">OUT OF STOCK</span>
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistButton
              productId={product.id}
              variant="ghost"
              size="icon"
              className="bg-card/70 backdrop-blur-sm rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-card/70 backdrop-blur-sm rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8"
              onClick={handleCompareToggle}
              title={isComparing ? "Remove from Compare" : "Add to Compare"}
            >
              <Layers size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-card/70 backdrop-blur-sm rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8"
              onClick={handleQuickView}
              title="Quick View"
            >
              <Eye size={16} />
            </Button>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col space-y-2">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{product.category}</span>
          <h3 className="text-sm font-bold truncate leading-tight flex-1" title={product.name}>
            <Link href={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">(123)</span>
          </div>

          {availableColors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {availableColors.slice(0, 5).map(color => (
                <div key={color} className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.toLowerCase() }} title={color} />
              ))}
              {availableColors.length > 5 && <div className="text-xs text-muted-foreground">+{availableColors.length - 5}</div>}
            </div>
          )}

          {isLowStock && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-orange-500">Only {product.total_stock} left in stock!</p>
              <Progress value={(product.total_stock / 20) * 100} className="h-1 bg-orange-100 [&>div]:bg-orange-500" />
            </div>
          )}
          
          <div className="flex items-end justify-between gap-2 pt-2">
            <div>
              <span className="text-lg font-bold text-primary">৳{displayPrice.toFixed(2)}</span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-xs text-muted-foreground line-through ml-1">৳{displayOriginalPrice.toFixed(2)}</span>
              )}
            </div>
            <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleAddToCart} disabled={isOutOfStock} title="Add to Cart">
              <ShoppingBag size={16} />
            </Button>
          </div>
        </div>
      </div>
      <QuickViewDialog product={product} open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen} />
    </>
  );
};
