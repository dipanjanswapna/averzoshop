'use client';

import { useState, useMemo, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, Heart, HelpCircle, MapPin, Share2, Printer, Gift, X, Store, CalendarDays, Truck } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/product';
import { TrustBadges } from './trust-badges';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { FlashSaleTimer } from './flash-sale-timer';
import { ShareButtons } from './share-buttons';
import { SizeGuideDialog } from './size-guide-dialog';
import { useCart } from '@/hooks/use-cart';
import { StoreAvailabilityDialog } from './store-availability-dialog';
import Barcode from 'react-barcode';
import { BarcodePopup } from './barcode-popup';
import { WishlistButton } from '../ui/wishlist-button';
import { Input } from '../ui/input';

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
  const [showShare, setShowShare] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  
  const { userData } = useAuth();
  const [deliveryArea, setDeliveryArea] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [pincode, setPincode] = useState('');

  const { addItem } = useCart();
  const { toast } = useToast();
  
  const checkDelivery = useCallback((area: string) => {
    const checkValue = (area || '').toLowerCase();
    
    const getEstimateString = (days: number) => {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' });
      return `${days} Days (${formatter.format(deliveryDate)})`;
    };

    if (checkValue.includes('dhaka')) {
      setDeliveryArea('Dhaka');
      setDeliveryEstimate(getEstimateString(2));
      setDeliveryCharge(60);
    } else {
      setDeliveryArea(area || 'Outside Dhaka');
      setDeliveryEstimate(getEstimateString(5));
      setDeliveryCharge(120);
    }
  }, []);

  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0) {
      const defaultAddress = userData.addresses[0];
      const areaIdentifier = defaultAddress.district || '';
      if (areaIdentifier) {
        setPincode(areaIdentifier);
        checkDelivery(areaIdentifier);
      }
    } else {
        checkDelivery('Dhaka');
        setPincode('Dhaka');
    }
  }, [userData, checkDelivery]); 

  const handlePincodeCheck = () => {
    checkDelivery(pincode);
  };
  
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
  
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const savings = originalPrice && originalPrice > displayPrice ? originalPrice - displayPrice : 0;
  
  const stock = selectedVariant ? selectedVariant.stock : 0;
  const stockStatus = stock > 10 ? 'In Stock' : stock > 0 ? `Only ${stock} left!` : 'Out of Stock';
  const stockColor = stock > 10 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-destructive';


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
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary uppercase">{product.group}</span>
              <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setShowShare(!showShare)}><Share2 size={20} /></Button>
                  {showShare && <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} className="absolute right-0 top-12 mt-2 w-48 bg-background border rounded-lg shadow-lg p-2 z-10 flex-col items-stretch space-y-1" />}
              </div>
           </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold font-headline text-foreground">{product.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By <Link href="#" className="text-primary font-semibold hover:underline">{product.brand}</Link></span>
           </div>
        </div>

        {product.flashSale?.enabled && <FlashSaleTimer endDate={product.flashSale.endDate} />}
        
        {savings > 0 && !isPreOrder && (
           <div className="bg-primary/10 text-primary font-bold text-sm p-3 rounded-md text-center mt-4">
              You save ৳{savings.toFixed(2)}!
           </div>
         )}

        {product.giftWithPurchase?.enabled && product.giftWithPurchase.description && (
            <div className="bg-green-100 text-green-800 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-4">
                <Gift size={24} className="flex-shrink-0" />
                <div>
                <p className="font-bold">Free Gift with Purchase!</p>
                <p className="text-sm">{product.giftWithPurchase.description}</p>
                </div>
            </div>
        )}
        
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
        
        <div className="space-y-4 py-4 border-t">
            
            {selectedVariant?.sku && (
                <button 
                  onClick={() => setIsBarcodeOpen(true)}
                  className="w-full text-left border rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
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
                </button>
            )}
        </div>

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
                <WishlistButton productId={product.id} variant="outline" size="icon" className="h-12 w-12" />
              </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-md">
                            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></Button>
                            <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => q + 1)} disabled={quantity >= stock}><Plus size={16}/></Button>
                        </div>
                        <WishlistButton productId={product.id} variant="outline" size="icon" className="h-12 w-12 ml-auto" />
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
                      <span className="text-sm text-muted-foreground">{deliveryArea}, Bangladesh</span>
                  </div>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Enter Area or Pincode" 
                      className="w-full pr-16"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                    <Button 
                      variant="ghost"
                      onClick={handlePincodeCheck}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-primary font-bold hover:text-primary"
                    >
                      Check
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Truck size={20} className="text-gray-400" />
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Estimated delivery by: <span className="font-bold text-foreground">{deliveryEstimate}</span>
                        </p>
                        <p className="text-xs text-green-600 font-semibold">Shipping Charge: ৳{deliveryCharge}</p>
                    </div>
                  </div>
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
      <BarcodePopup 
        open={isBarcodeOpen} 
        onOpenChange={setIsBarcodeOpen}
        product={product}
        variant={selectedVariant}
      />
    </>
  );
}
