'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';


interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
  }, [product, open]);

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

  const content = (
    <>
      {/* Image Gallery */}
      <div className="w-full md:w-1/2 bg-muted/50 p-4 flex flex-col gap-4 sticky top-0 md:relative z-10">
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
                {discount > 0 && !isOutOfStock && <Badge className="text-[10px] font-bold px-2 py-0.5" variant="destructive">{discount}% OFF</Badge>}
                {product.preOrder?.enabled && <Badge className="text-[10px] font-bold px-2 py-0.5 bg-purple-600">Pre-Order</Badge>}
                {isFlashSaleActive && <Badge className="text-[10px] font-bold px-2 py-0.5 bg-orange-500 animate-pulse flex items-center gap-1"><Zap size={12} /> FLASH SALE</Badge>}
                {product.giftWithPurchase?.enabled && <Badge className="text-[10px] font-bold px-2 py-0.5 bg-green-600 flex items-center gap-1"><Gift size={12}/> FREE GIFT</Badge>}
                {product.isNew && <Badge className="text-[10px] font-bold px-2 py-0.5 bg-blue-500">NEW</Badge>}
                {product.isBestSeller && <Badge className="text-[10px] font-bold px-2 py-0.5 bg-teal-500">BEST SELLER</Badge>}
            </div>
        </div>
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2">
                {allMedia.map((media, index) => (
                <CarouselItem key={index} className="basis-1/4 sm:basis-1/5 pl-2">
                    <button
                        onClick={() => setActiveMedia(media)}
                        className={cn("relative aspect-square w-full rounded-md overflow-hidden border-2 flex-shrink-0", activeMedia.src === media.src ? 'border-primary' : 'border-transparent')}
                    >
                        <Image src={media.type === 'video' ? getYouTubeThumbnail(media.src) : media.src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                        {media.type === 'video' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Youtube className="text-white h-6 w-6" /></div>
                        )}
                    </button>
                </CarouselItem>
                ))}
            </CarouselContent>
            {allMedia.length > 5 && (
            <>
                <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/80 hover:bg-white text-black h-7 w-7" />
                <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/80 hover:bg-white text-black h-7 w-7" />
            </>
            )}
        </Carousel>
      </div>
      {/* Product Details */}
      <div className="w-full md:w-1/2 flex flex-col">
        <ScrollArea className="h-full">
            <div className="p-6 space-y-3">
            <div>
                <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
                <h2 className="text-xl font-bold font-headline">{product.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5 text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < 4 ? "fill-current" : "text-gray-300"} />)}</div>
                    <span className="text-xs text-muted-foreground">(123 reviews)</span>
                </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description.length > 150 ? `${product.description.substring(0, 150)}...` : product.description}
            </p>
            <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-bold font-roboto text-primary">৳{displayPrice.toFixed(2)}</span>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                    <span className="text-lg text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
                )}
            </div>
            {isFlashSaleActive && product.flashSale?.endDate && <FlashSaleTimer endDate={product.flashSale.endDate} />}
            {product.giftWithPurchase?.enabled && product.giftWithPurchase.description && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md flex items-center gap-3">
                    <Gift size={24} />
                    <div><p className="font-bold text-sm">Free Gift:</p><p className="text-xs">{product.giftWithPurchase.description}</p></div>
                </div>
            )}
            <div className="space-y-3 pt-2">
                {availableColors.length > 0 && (
                <div className="space-y-2"><p className="font-semibold text-sm">Color: <span className="font-normal text-muted-foreground">{selectedColor}</span></p><div className="flex flex-wrap gap-2">{availableColors.map(color => (<button key={color} onClick={() => setSelectedColor(color)} className={cn('h-8 w-8 rounded-full border-2 transition-transform transform hover:scale-110', selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border')} style={{ backgroundColor: color.toLowerCase() }} title={color} />))}</div></div>
                )}
                {availableSizes.length > 0 && (
                <div className="space-y-2"><p className="font-semibold text-sm">Size: <span className="font-normal text-muted-foreground">{selectedSize}</span></p><div className="flex flex-wrap gap-2">{availableSizes.map(size => (<button key={size} onClick={() => setSelectedSize(size)} className={cn('h-9 px-3 border rounded-md text-xs font-medium transition-colors', selectedSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted')}>{size}</button>))}</div></div>
                )}
            </div>
            <div className="flex items-center gap-2 text-sm pt-2">
                <p className="font-semibold">Availability:</p>
                {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
                ) : product.preOrder?.enabled ? (
                <Badge className="bg-blue-600/10 text-blue-600">Pre-order</Badge>
                ) : (
                <Badge className="bg-green-600/10 text-green-600">In Stock: {stockCount} items</Badge>
                )}
            </div>
            <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">Quantity:</p>
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleQuantityChange(-1)}><Minus size={14} /></Button>
                        <span className="font-bold text-sm w-8 text-center">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleQuantityChange(1)}><Plus size={14} /></Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleAddToCart} size="lg" className="w-full h-11 text-sm flex-1" disabled={isOutOfStock}>
                        <ShoppingBag size={18} className="mr-2" />
                        {product.preOrder?.enabled ? 'Pre-order Now' : 'Add to Bag'}
                    </Button>
                    <WishlistButton productId={product.id} variant="outline" size="icon" className="h-11 w-11 flex-shrink-0" />
                </div>
            </div>
            <div className="pt-3 border-t">
                <Button variant="link" asChild className="p-0 h-auto">
                    <Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)}>
                        View Full Product Details <ArrowRight size={16} className="ml-2" />
                    </Link>
                </Button>
            </div>
            </div>
          </ScrollArea>
        </div>
    </>
  );

  if (isMobile) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[90vh] flex flex-col p-0">
                <ScrollArea className="h-full">
                    {content}
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] h-auto max-h-[90vh] flex flex-col md:flex-row p-0 gap-0">
        {content}
      </DialogContent>
    </Dialog>
  );
}
