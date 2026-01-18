

'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import type { Product, ProductVariant } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Ruler, Barcode, MapPin, Share2, Star, Gift } from 'lucide-react';
import { cn, getVariantsAsArray } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from '../ui/wishlist-button';
import { SizeGuideDialog } from './size-guide-dialog';
import { BarcodePopup } from './barcode-popup';
import { StoreAvailabilityDialog } from './store-availability-dialog';
import { NotifyMeButton } from './notify-me-button';
import { FlashSaleTimer } from './flash-sale-timer';
import { TrustBadges } from './trust-badges';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShareButtons } from './share-buttons';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';

interface ProductDetailsProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  selectedColor: string | null;
  setSelectedColor: Dispatch<SetStateAction<string | null>>;
  selectedSize: string | null;
  setSelectedSize: Dispatch<SetStateAction<string | null>>;
  isOutOfStock: boolean;
}

export function ProductDetails({
  product,
  selectedVariant,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  isOutOfStock,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isStoreAvailabilityOpen, setIsStoreAvailabilityOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isMobile = useIsMobile();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const variantsArray = getVariantsAsArray(product.variants);
    return [...new Set(variantsArray.map(v => v.color).filter(Boolean))];
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const variantsArray = getVariantsAsArray(product.variants);
    return [...new Set(variantsArray.map(v => v.size).filter(Boolean))];
  }, [product]);
  
  const handleMobileShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this amazing product: ${product.name}`,
      url: shareUrl,
    };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error(err);
            // Fallback to dialog if share fails (e.g., user cancels)
            setIsShareOpen(true);
        }
    } else {
        // Fallback for browsers that don't support Web Share API
        setIsShareOpen(true);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({
        variant: 'destructive',
        title: 'Unavailable',
        description: 'Please select a size and color.',
      });
      return;
    }
    addItem(product, selectedVariant);
  };
  
  const isFlashSaleActive = useMemo(() => {
    if (!product.flashSale?.enabled || !product.flashSale.endDate) {
      return false;
    }
    const endDate = product.flashSale.endDate.toDate ? product.flashSale.endDate.toDate() : new Date(product.flashSale.endDate);
    return endDate > new Date();
  }, [product.flashSale]);
  
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
        <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(4)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                <Star size={16} className="text-gray-300" />
            </div>
            <span className="text-sm text-muted-foreground">(123 reviews)</span>
        </div>
      </div>
      
      {isFlashSaleActive && product.flashSale?.endDate && (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-destructive animate-pulse">Hurry, limited time deal!</p>
            <FlashSaleTimer endDate={product.flashSale.endDate} />
        </div>
      )}
      
      <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold font-roboto text-primary">৳{displayPrice.toFixed(2)}</span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-xl text-muted-foreground line-through">৳{displayOriginalPrice.toFixed(2)}</span>
          )}
      </div>

      {product.giftWithPurchase?.enabled && product.giftWithPurchase.description && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg flex items-center gap-4 animate-pulse">
            <Gift size={28} />
            <div>
            <p className="font-bold text-sm">FREE GIFT!</p>
            <p className="text-xs">{product.giftWithPurchase.description}</p>
            </div>
        </div>
      )}
      
       {product.preOrder?.enabled && product.preOrder.releaseDate?.toDate && (
        <div className="text-sm text-purple-600 font-semibold bg-purple-50 p-3 rounded-md border border-purple-200">
            This is a pre-order item. Expected release date: {format(product.preOrder.releaseDate.toDate(), "MMMM d, yyyy")}
        </div>
      )}

      {availableColors.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold">Color: <span className="font-normal text-muted-foreground">{selectedColor}</span></p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button key={color} onClick={() => setSelectedColor(color)} className={cn('h-10 w-10 rounded-full border-2 transition-transform transform hover:scale-110', selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border')} style={{ backgroundColor: color.toLowerCase() }} title={color} />
            ))}
          </div>
        </div>
      )}

      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Size: <span className="font-normal text-muted-foreground">{selectedSize}</span></p>
            <button onClick={() => setIsSizeGuideOpen(true)} className="text-sm text-primary hover:underline flex items-center gap-1"><Ruler size={14} /> Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <button key={size} onClick={() => setSelectedSize(size)} className={cn('h-10 px-4 border rounded-md text-sm font-medium transition-colors', selectedSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted')}>
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Availability:</p>
        {isOutOfStock ? (
          <Badge variant="destructive">Out of Stock</Badge>
        ) : product.preOrder?.enabled ? (
          <Badge className="bg-purple-100 text-purple-800">Pre-order</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800">In Stock</Badge>
        )}
      </div>

      <div className="space-y-3 pt-6 border-t">
        {isOutOfStock ? (
          <NotifyMeButton productId={product.id} productName={product.name} />
        ) : (
           <div className="flex flex-col md:flex-row gap-3">
              <Button onClick={handleAddToCart} size="lg" className="w-full h-12 flex items-center gap-2">
                <ShoppingBag size={20} /> {product.preOrder?.enabled ? 'Pre-order Now' : 'Add to Bag'}
              </Button>
              <WishlistButton productId={product.id} size="lg" variant="outline" className="w-full h-12 flex items-center gap-2" />
            </div>
        )}
      </div>

       <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pt-6 border-t">
          <Button variant="ghost" onClick={() => setIsStoreAvailabilityOpen(true)} className="text-sm justify-start gap-2"><MapPin size={16}/> Check In-Store</Button>
          <Button variant="ghost" onClick={() => setIsBarcodeOpen(true)} className="text-sm justify-start gap-2"><Barcode size={16}/> Show Barcode</Button>
          {isMobile ? (
            <Button variant="ghost" onClick={handleMobileShare} className="text-sm justify-start gap-2"><Share2 size={16}/> Share</Button>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="text-sm justify-start gap-2"><Share2 size={16}/> Share</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <ShareButtons url={shareUrl} />
              </PopoverContent>
            </Popover>
          )}
      </div>
      
      {/* Mobile Share Dialog Fallback */}
       <Dialog open={isMobile && isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this product</DialogTitle>
          </DialogHeader>
          <ShareButtons url={shareUrl} className="py-4" />
        </DialogContent>
      </Dialog>

      <TrustBadges /> 

      <SizeGuideDialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen} />
      <BarcodePopup open={isBarcodeOpen} onOpenChange={setIsBarcodeOpen} product={product} variant={selectedVariant} />
      <StoreAvailabilityDialog open={isStoreAvailabilityOpen} onOpenChange={setIsStoreAvailabilityOpen} product={product} />
    </div>
  );
}
