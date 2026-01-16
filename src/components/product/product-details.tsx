'use client';

import { useState, useMemo, useEffect, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, Heart, HelpCircle, MapPin, Share2, Printer, Gift, X, Store, Calendar, CalendarDays } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/product';
import { TrustBadges } from './trust-badges';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { SaleTimer } from './sale-timer';
import { ShareButtons } from './share-buttons';
import { SizeGuideDialog } from './size-guide-dialog';
import { useCart } from '@/hooks/use-cart';
import { StoreAvailabilityDialog } from './store-availability-dialog';
import Barcode from 'react-barcode';

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
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  const { addItem } = useCart();
  const { user, firestore, userData } = useAuth();
  const { toast } = useToast();
  

  const isPreOrder = product.preOrder?.enabled;
  const releaseDate = isPreOrder && product.preOrder.releaseDate
    ? (product.preOrder.releaseDate.toDate ? product.preOrder.releaseDate.toDate() : new Date(product.preOrder.releaseDate))
    : null;


  const variantsArray = useMemo(
    () =>
      Array.isArray(product.variants)
        ? product.variants
        : product.variants && typeof product.variants === 'object'
        ? Object.values(product.variants)
        : [],
    [product.variants]
  );

  const uniqueColors = useMemo(() => [...new Set(variantsArray.map(v => v.color).filter(Boolean))], [variantsArray]);
  const uniqueSizes = useMemo(() => [...new Set(variantsArray.map(v => v.size).filter(Boolean))], [variantsArray]);

  // Derived state to check availability of sizes for the selected color
  const availableSizesForSelectedColor = useMemo(() => {
    if (!selectedColor || uniqueSizes.length === 0) return new Set(uniqueSizes);
    const available = new Set<string>();
    variantsArray.forEach(v => {
      if (v.color === selectedColor && v.size && v.stock > 0) {
        available.add(v.size);
      }
    });
    return available;
  }, [selectedColor, variantsArray, uniqueSizes]);

  // Derived state to check availability of colors for the selected size
  const availableColorsForSelectedSize = useMemo(() => {
    if (!selectedSize || uniqueColors.length === 0) return new Set(uniqueColors);
    const available = new Set<string>();
    variantsArray.forEach(v => {
      if (v.size === selectedSize && v.color && v.stock > 0) {
        available.add(v.color);
      }
    });
    return available;
  }, [selectedSize, variantsArray, uniqueColors]);

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    // If current size is not available with the new color, try to find a valid one
    if (selectedSize && !variantsArray.some(v => v.color === color && v.size === selectedSize && v.stock > 0)) {
        const firstAvailableSize = variantsArray.find(v => v.color === color && v.stock > 0)?.size || null;
        setSelectedSize(firstAvailableSize);
    }
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
     // If current color is not available with the new size, try to find a valid one
    if (selectedColor && !variantsArray.some(v => v.size === size && v.color === selectedColor && v.stock > 0)) {
        const firstAvailableColor = variantsArray.find(v => v.size === size && v.stock > 0)?.color || null;
        setSelectedColor(firstAvailableColor);
    }
  }

  // Check wishlist status
  useEffect(() => {
    if (userData?.wishlist?.includes(product.id)) {
      setIsWishlisted(true);
    } else {
      setIsWishlisted(false);
    }
  }, [userData, product.id]);
  
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const savings = originalPrice && originalPrice > displayPrice ? originalPrice - displayPrice : 0;
  
  const stock = selectedVariant ? selectedVariant.stock : 0;
  const stockStatus = stock > 10 ? 'In Stock' : stock > 0 ? `Only ${stock} left!` : 'Out of Stock';
  const stockColor = stock > 10 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-destructive';


  const handleWishlistToggle = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Please login", description: "You need to be logged in to manage your wishlist." });
      return;
    }
    const userWishlistRef = doc(firestore, "users", user.uid);
    try {
      if (isWishlisted) {
        await updateDoc(userWishlistRef, { wishlist: arrayRemove(product.id) });
        toast({ title: "Removed from wishlist" });
      } else {
        await updateDoc(userWishlistRef, { wishlist: arrayUnion(product.id) });
        toast({ title: "Added to wishlist" });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({ variant: "destructive", title: "Could not update wishlist" });
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast({ variant: "destructive", title: "Unavailable", description: "This variant is out of stock or invalid." });
      return;
    }
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
     if (isOutOfStock) {
      toast({ variant: "destructive", title: "Unavailable", description: "This variant is out of stock or invalid." });
      return;
    }
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  const handlePreOrder = () => {
    if (!product || !selectedVariant) {
        toast({ variant: "destructive", title: "Variant not selected", description: "Please select a color and size." });
        return;
    }
    addItem(product, selectedVariant, quantity);
  };

  return (
    <>
      <div className="flex flex-col gap-4 no-print">
        <div>
           <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary uppercase">{product.group}</span>
              <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setShowShare(!showShare)}><Share2 size={20} /></Button>
                  {showShare && <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} />}
              </div>
           </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold font-headline text-foreground mt-2">{product.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>By <Link href="#" className="text-primary font-semibold hover:underline">{product.brand}</Link></span>
           </div>
        </div>

        {product.flashSale && <SaleTimer endDate={product.flashSale.endDate} />}

        <div className="flex items-center justify-between pt-2">
           <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary font-roboto">৳{displayPrice.toFixed(2)}</span>
            {originalPrice && originalPrice > displayPrice && (
               <span className="text-lg text-muted-foreground line-through font-roboto">৳{originalPrice.toFixed(2)}</span>
            )}
          </div>
          {!isPreOrder && (
            <div className={cn("text-sm font-semibold", stockColor)}>
                {stockStatus}
            </div>
          )}
        </div>

        {savings > 0 && !isPreOrder && (
           <div className="bg-primary/10 text-primary font-bold text-sm p-3 rounded-md text-center mt-2">
              You save ৳{savings.toFixed(2)}!
           </div>
         )}
        
         <div className="space-y-4 py-4">
            {product.giftWithPurchase?.enabled && product.giftWithPurchase.description && (
                <div className="bg-green-100 text-green-800 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-4">
                    <Gift size={24} className="flex-shrink-0" />
                    <div>
                    <p className="font-bold">Free Gift with Purchase!</p>
                    <p className="text-sm">{product.giftWithPurchase.description}</p>
                    </div>
                </div>
            )}
        </div>
        
        {selectedVariant?.sku && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-sm font-bold">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Brand: {product.brand}</p>
                <p className="text-xs text-muted-foreground">Sold by: Vendor ID {product.vendorId}</p>
              </div>
              <div className="flex items-center justify-end">
                <Barcode value={selectedVariant.sku} height={40} width={1.5} displayValue={true} fontSize={10} />
              </div>
            </div>
          </div>
        )}

        {uniqueColors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground">Color: <span className="text-foreground capitalize">{selectedColor}</span></h3>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map(color => {
                  const isAvailable = uniqueSizes.length === 0 ? variantsArray.some(v => v.color === color && v.stock > 0) : availableColorsForSelectedSize.has(color);
                return (
                <button key={color} onClick={() => handleSelectColor(color)}
                  className={cn("h-8 w-8 rounded-full border-2 transition-all relative", 
                      selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border',
                      !isAvailable && !isPreOrder && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: color.toLowerCase() }} title={color} disabled={!isAvailable && !isPreOrder}>
                      {!isAvailable && !isPreOrder && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><X size={16} className="text-destructive" /></div>}
                  </button>
              )})}
            </div>
          </div>
        )}

        {uniqueSizes.length > 0 && (
          <div className="space-y-3">
              <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground">Size</h3>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <HelpCircle size={14} /> Size Guide
                  </button>
              </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map(size => {
                  const isAvailable = uniqueColors.length === 0 ? variantsArray.some(v => v.size === size && v.stock > 0) : availableSizesForSelectedColor.has(size);
                  return (
                    <Button 
                    key={size} 
                    variant={selectedSize === size ? 'default' : 'outline'} 
                    onClick={() => handleSelectSize(size)} 
                    className="w-14 relative overflow-hidden"
                    disabled={!isAvailable && !isPreOrder}
                  >
                    {size}
                    {!isAvailable && !isPreOrder && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5"> 
                         <X size={14} className="text-destructive opacity-40 rotate-12" />
                      </div>
                    )}
                  </Button>
              )})}
            </div>
          </div>
        )}
        
        <div className="pt-4">
          <div className='min-h-[104px]'>
             {isPreOrder ? (
                <div className="flex flex-col gap-4 p-4 border rounded-2xl bg-orange-50/30 border-orange-200">
                  {releaseDate && (
                    <div className="flex items-start gap-3 text-orange-800">
                      <CalendarDays className="mt-1 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-sm uppercase">Pre-order Available</p>
                        <p className="text-sm">সম্ভাব্য ডেলিভারি শুরু: <span className="font-bold">{releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                      </div>
                    </div>
                  )}
                  {product.preOrder?.depositAmount != null && product.preOrder.depositAmount > 0 && (
                    <div className="text-xs text-orange-600 bg-white p-2 rounded border border-orange-100">
                      বুকিং করতে পণ্যটির মূল দামের মাত্র <strong>{product.preOrder.depositType === 'percentage' ? `${product.preOrder.depositAmount}%` : `৳${product.preOrder.depositAmount}`}</strong> অগ্রিম প্রদান করতে হবে।
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 text-lg font-bold gap-2" onClick={handlePreOrder}>
                    <ShoppingBag size={20} /> PRE-ORDER NOW
                  </Button>
                </div>
            ) : isOutOfStock ? (
              <div className="flex w-full items-center gap-4">
                <Button size="lg" disabled className="flex-1 h-12">
                  Out of Stock
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleWishlistToggle}>
                    <Heart size={20} className={cn(isWishlisted ? 'text-destructive fill-destructive' : 'text-foreground')} />
                </Button>
              </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-md">
                            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></Button>
                            <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => q + 1)} disabled={quantity >= stock}><Plus size={16}/></Button>
                        </div>
                        <Button variant="outline" size="icon" className="h-12 w-12 ml-auto" onClick={handleWishlistToggle}>
                            <Heart size={20} className={cn(isWishlisted ? 'text-destructive fill-destructive' : 'text-foreground')} />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button size="lg" variant="outline" className="w-full h-12" onClick={handleAddToCart}>
                            <ShoppingBag size={20} className="mr-2" /> Add to Bag
                        </Button>
                        <Button size="lg" className="w-full h-12" onClick={handleBuyNow}>Buy Now</Button>
                    </div>
                </div>
            )}
          </div>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6">
             <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-bold text-sm">Delivery Options</h4>
                  <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Dhaka, Bangladesh</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <input type="text" placeholder="Enter Pincode" className="text-sm border-b focus:outline-none focus:border-primary" />
                      <button className="text-primary font-bold text-sm">Check</button>
                  </div>
                  <p className="text-xs text-muted-foreground">Estimated delivery by: <span className="font-bold text-foreground">{(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></p>
             </div>
             <div className="border rounded-lg p-4 space-y-3 flex flex-col justify-center items-center text-center">
                 <Store className="h-8 w-8 text-muted-foreground" />
                  <h4 className="font-bold text-sm">In-Store Availability</h4>
                  <p className="text-xs text-muted-foreground">Check if this product is available at a store near you.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsAvailabilityOpen(true)}>
                    Check Stores
                  </Button>
             </div>
        </div>

        <TrustBadges />
        <SizeGuideDialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen} />
        <StoreAvailabilityDialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen} product={product} />

      </div>
    </>
  );
}
