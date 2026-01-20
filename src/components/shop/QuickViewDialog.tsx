
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Product, ProductVariant } from '@/types/product';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Plus, ShoppingBag, ArrowRight, Youtube, Gift, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from '../ui/wishlist-button';
import { ScrollArea } from '../ui/scroll-area';
import { FlashSaleTimer } from '../product/flash-sale-timer';

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeMedia, setActiveMedia] = useState({ type: 'image', src: product?.image || '' });

  const allMedia = useMemo(() => {
    if (!product) return [];
    const mediaSet = new Map<string, { type: 'image' | 'video', src: string }>();
    
    if (product.image) mediaSet.set(product.image, { type: 'image', src: product.image });
    product.gallery?.forEach(src => {
        if (src) mediaSet.set(src, { type: 'image', src });
    });

    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
    variantsArray.forEach(v => {
      if (v?.image) mediaSet.set(v.image, { type: 'image', src: v.image });
    });

    product.videos?.forEach(src => {
        if (src) mediaSet.set(src, { type: 'video', src });
    });

    return Array.from(mediaSet.values());
  }, [product]);


  useEffect(() => {
    if (product) {
      const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
      const initialVariant = variantsArray.find(v => (v.stock || 0) > 0) || variantsArray[0] || null;
      
      if (initialVariant) {
        setSelectedColor(initialVariant.color || null);
        setSelectedSize(initialVariant.size || null);
      }
      setActiveMedia({ type: 'image', src: product.image });
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
    const uniqueColors = [...new Set(variantsArray.map(v => v.color).filter(Boolean))];
    const uniqueSizes = [...new Set(variantsArray.map(v => v.size).filter(Boolean))];

    const variant = variantsArray.find(v => {
        const colorMatch = uniqueColors.length === 0 || v.color === selectedColor;
        const sizeMatch = uniqueSizes.length === 0 || v.size === selectedSize;
        return colorMatch && sizeMatch;
    }) || null;
    
    setSelectedVariant(variant);
    if(variant?.image) {
        setActiveMedia({ type: 'image', src: variant.image });
    } else if (product?.image) {
        setActiveMedia({ type: 'image', src: product.image });
    }

  }, [selectedColor, selectedSize, product]);

  const { displayPrice, displayOriginalPrice, isOutOfStock, stockCount, isFlashSaleActive, discount } = useMemo(() => {
    if (!product) return { displayPrice: 0, displayOriginalPrice: null, isOutOfStock: true, stockCount: 0, isFlashSaleActive: false, discount: 0 };
    
    const price = selectedVariant?.price ?? product.price;
    const originalPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
    const stock = selectedVariant?.stock ?? product.total_stock;
    
    const outOfStock = !product.preOrder?.enabled && stock <= 0;

    const flashSale = product.flashSale?.enabled && product.flashSale.endDate && (product.flashSale.endDate.toDate ? product.flashSale.endDate.toDate() : new Date(product.flashSale.endDate)) > new Date();

    let calculatedDiscount = 0;
    if (originalPrice && originalPrice > price) {
        calculatedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    
    return {
      displayPrice: price,
      displayOriginalPrice: originalPrice,
      isOutOfStock: outOfStock,
      stockCount: stock,
      isFlashSaleActive: flashSale,
      discount: calculatedDiscount
    };
  }, [product, selectedVariant]);
  
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
    return [...new Set(variantsArray.map(v => v.color).filter(Boolean))];
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
    return [...new Set(variantsArray.map(v => v.size).filter(Boolean))];
  }, [product]);

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
        const newQuantity = prev + amount;
        if (newQuantity < 1) return 1;
        if (!product.preOrder?.enabled && newQuantity > stockCount) {
            toast({ variant: 'destructive', title: 'Stock limit reached' });
            return stockCount;
        }
        return newQuantity;
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({ variant: 'destructive', title: 'Unavailable', description: 'Please select from available options.' });
      return;
    }
    addItem(product, selectedVariant, quantity);
    onOpenChange(false);
  };
  
  const getYouTubeThumbnail = (url: string) => {
    if (!url || !url.includes('embed/')) return 'https://placehold.co/120x90?text=Invalid+Video';
    const videoId = url.split('embed/')[1]?.split('?')[0];
    if (!videoId) return 'https://placehold.co/120x90?text=Invalid+Video';
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const getAutoplayUrl = (url: string) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    // Mute is often required for autoplay to work
    return `${url}${separator}autoplay=1&mute=1`;
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-auto md:h-[90vh] flex flex-col md:flex-row p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Quick View: {product.name}</DialogTitle>
          <DialogDescription>Quickly view product details, select options, and add to cart.</DialogDescription>
        </DialogHeader>
        <div className="w-full md:w-1/2 bg-muted/30 p-4 md:p-6 flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border">
            {activeMedia.type === 'video' ? (
                <iframe className="w-full h-full" src={getAutoplayUrl(activeMedia.src)} title={product.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            ) : (
                <Image src={activeMedia.src} alt={product.name} fill sizes="(max-width: 768px) 90vw, 45vw" className="object-cover" />
            )}
             {isOutOfStock && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none">
                    <span className="bg-destructive text-destructive-foreground font-bold text-lg px-6 py-3 rounded-md uppercase tracking-widest -rotate-12 border-2 border-destructive">Out of Stock</span>
                </div>
            )}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                {discount > 0 && !isOutOfStock && <Badge variant="destructive">{discount}% OFF</Badge>}
                {product.preOrder?.enabled && <Badge className="bg-purple-600">Pre-Order</Badge>}
                {isFlashSaleActive && <Badge className="bg-orange-500 animate-pulse flex items-center gap-1"><Zap size={12} /> FLASH SALE</Badge>}
                {product.giftWithPurchase?.enabled && <Badge className="bg-green-600 flex items-center gap-1"><Gift size={12}/> FREE GIFT</Badge>}
            </div>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
                {allMedia.map((media, index) => (
                <button
                    key={index}
                    onClick={() => setActiveMedia(media)}
                    className={cn("relative aspect-square w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0", activeMedia.src === media.src ? 'border-primary' : 'border-transparent')}
                >
                    <Image src={media.type === 'video' ? getYouTubeThumbnail(media.src) : media.src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                    {media.type === 'video' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Youtube className="text-white h-6 w-6" /></div>
                    )}
                </button>
                ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col">
          <ScrollArea className="h-full">
            <div className="p-6 md:p-8 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
                <h2 className="text-2xl font-bold font-headline">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5 text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < 4 ? "fill-current" : "text-gray-300"} />)}</div>
                    <span className="text-sm text-muted-foreground">(123 reviews)</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description.length > 150 ? `${product.description.substring(0, 150)}...` : product.description}
              </p>

              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-4xl font-bold font-roboto text-primary">৳{displayPrice.toFixed(2)}</span>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                    <span className="text-xl text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
                )}
              </div>
              
               {isFlashSaleActive && product.flashSale?.endDate && <FlashSaleTimer endDate={product.flashSale.endDate} />}
               {product.giftWithPurchase?.enabled && product.giftWithPurchase.description && (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md flex items-center gap-3">
                      <Gift size={24} />
                      <div><p className="font-bold text-sm">Free Gift:</p><p className="text-xs">{product.giftWithPurchase.description}</p></div>
                  </div>
              )}

              {availableColors.length > 0 && (
                <div className="space-y-2 pt-2"><p className="font-semibold text-sm">Color: <span className="font-normal text-muted-foreground">{selectedColor}</span></p><div className="flex flex-wrap gap-2">{availableColors.map(color => (<button key={color} onClick={() => setSelectedColor(color)} className={cn('h-8 w-8 rounded-full border-2 transition-transform transform hover:scale-110', selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border')} style={{ backgroundColor: color.toLowerCase() }} title={color} />))}</div></div>
              )}
              {availableSizes.length > 0 && (
                <div className="space-y-2 pt-2"><p className="font-semibold text-sm">Size: <span className="font-normal text-muted-foreground">{selectedSize}</span></p><div className="flex flex-wrap gap-2">{availableSizes.map(size => (<button key={size} onClick={() => setSelectedSize(size)} className={cn('h-9 px-4 border rounded-md text-sm font-medium transition-colors', selectedSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted')}>{size}</button>))}</div></div>
              )}

              <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md">
                          <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => handleQuantityChange(-1)}><Minus size={16} /></Button>
                          <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                          <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => handleQuantityChange(1)}><Plus size={16} /></Button>
                      </div>
                      <Button onClick={handleAddToCart} size="lg" className="w-full h-12 text-base" disabled={isOutOfStock}>
                          <ShoppingBag size={20} className="mr-2" />
                          {product.preOrder?.enabled ? 'Pre-order Now' : 'Add to Bag'}
                      </Button>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="text-sm text-muted-foreground">
                        <p>SKU: <span className="font-mono">{selectedVariant?.sku || 'N/A'}</span></p>
                        {!isOutOfStock && <p className="text-green-600 font-bold">In Stock: {stockCount} items</p>}
                     </div>
                     <WishlistButton productId={product.id} variant="secondary" />
                  </div>
              </div>

              <div className="pt-4 border-t">
                  <Button variant="link" asChild className="p-0 h-auto">
                      <Link href={`/product/${product.id}`}>
                          View Full Product Details <ArrowRight size={16} className="ml-2" />
                      </Link>
                  </Button>
              </div>

            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
