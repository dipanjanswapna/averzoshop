
'use client';

import Image from 'next/image';
import { ShoppingBag, Layers, Gift, MapPin, Zap } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import { useCompare } from '@/hooks/use-compare';
import { WishlistButton } from './ui/wishlist-button';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { items: compareItems, addItem: addCompareItem, removeItem: removeCompareItem } = useCompare();
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
  
  const stockStatus = !isOutOfStock && !product.preOrder?.enabled && product.total_stock > 0 && product.total_stock < 10 ? 'Low Stock' : null;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
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


  return (
    <Link href={`/product/${product.id}`} className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image && (
            <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        )}
        
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
           {isFlashSaleActive && (
            <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1"><Zap size={10} /> FLASH SALE</span>
          )}
          {product.preOrder?.enabled && (
            <span className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Pre-order</span>
          )}
          {variantDiscount > 0 && !isOutOfStock && (
            <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">{variantDiscount}% OFF</span>
          )}
           {product.giftWithPurchase?.enabled && (
            <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Gift size={10} /> GIFT
            </span>
          )}
          {stockStatus && (
             <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">{stockStatus}</span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none">
             <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full -rotate-12">OUT OF STOCK</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <WishlistButton
            productId={product.id}
            variant="ghost"
            size="icon"
            className="bg-card rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground h-8 w-8"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 bg-card rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors h-8 w-8"
            onClick={handleCompareToggle}
          >
            <Layers size={16} />
          </Button>
        </div>
      </div>

      <div className="p-2 space-y-1">
        <h3 className="text-xs font-bold truncate leading-tight" title={product.name}>{product.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-primary">৳{displayPrice.toFixed(2)}</span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-[10px] text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};
