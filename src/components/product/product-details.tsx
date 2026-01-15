
'use client';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, Heart, HelpCircle, MapPin, Share2 } from 'lucide-react';
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

export function ProductDetails({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { addItem } = useCart();
  const { user, firestore } = useAuth();
  const { toast } = useToast();

  const uniqueColors = useMemo(() => [...new Set(product.variants?.map(v => v.color).filter(Boolean))], [product.variants]);
  const uniqueSizes = useMemo(() => [...new Set(product.variants?.map(v => v.size).filter(Boolean))], [product.variants]);
  
  useEffect(() => {
    if (uniqueColors.length > 0 && !selectedColor) {
      setSelectedColor(uniqueColors[0]);
    }
    if (uniqueSizes.length > 0 && !selectedSize) {
      setSelectedSize(uniqueSizes[0]);
    }
  }, [uniqueColors, uniqueSizes, selectedColor, selectedSize]);

  useEffect(() => {
    const variant = product.variants?.find(v => {
      const colorMatch = uniqueColors.length === 0 || v.color === selectedColor;
      const sizeMatch = uniqueSizes.length === 0 || v.size === selectedSize;
      return colorMatch && sizeMatch;
    }) || null;
    setSelectedVariant(variant);
    setQuantity(1);
  }, [selectedColor, selectedSize, product.variants, uniqueColors.length, uniqueSizes.length]);

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = displayPrice / (1 - (product.discount || 0) / 100);
  const stock = selectedVariant ? selectedVariant.stock : product.total_stock;
  const stockStatus = stock > 10 ? 'In Stock' : stock > 0 ? `Only ${stock} left!` : 'Out of Stock';
  const stockColor = stock > 10 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-destructive';
  const savings = originalPrice - displayPrice;

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
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({ variant: "destructive", title: "Could not update wishlist" });
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || stock <= 0) {
      toast({ variant: "destructive", title: "Unavailable", description: "This variant is out of stock or invalid." });
      return;
    }
    addItem(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
     if (!selectedVariant || stock <= 0) {
      toast({ variant: "destructive", title: "Unavailable", description: "This variant is out of stock or invalid." });
      return;
    }
    addItem(product, selectedVariant, quantity);
    toast({ title: "Proceeding to Checkout", description: "Redirecting you to the checkout page." });
    // router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
         <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary uppercase">{product.group}</span>
            <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setShowShare(!showShare)}><Share2 size={20} /></Button>
                {showShare && <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} />}
            </div>
         </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline text-foreground mt-1">{product.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>By <Link href="#" className="text-primary font-semibold hover:underline">{product.brand}</Link></span>
            <span className="h-4 border-l border-border"></span>
            <span>SKU: {selectedVariant?.sku || product.baseSku}</span>
        </div>
      </div>

       {product.flashSale && <SaleTimer endDate={product.flashSale.endDate} />}

      <div className="flex items-center justify-between">
         <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary font-roboto">৳{displayPrice.toFixed(2)}</span>
          {product.discount > 0 && (
             <span className="text-lg text-muted-foreground line-through font-roboto">৳{originalPrice.toFixed(2)}</span>
          )}
        </div>
        <div className={cn("text-sm font-semibold", stockColor)}>
          {stockStatus}
        </div>
      </div>

       {savings > 0 && (
         <div className="bg-primary/10 text-primary font-bold text-sm p-2 rounded-md text-center">
            You save ৳{savings.toFixed(2)}!
         </div>
       )}
      
      {uniqueColors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">Color: <span className="text-foreground capitalize">{selectedColor}</span></h3>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map(color => (
              <button key={color} onClick={() => setSelectedColor(color)}
                className={cn("h-8 w-8 rounded-full border-2 transition-all", selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border')}
                style={{ backgroundColor: color.toLowerCase() }} title={color} />
            ))}
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
            {uniqueSizes.map(size => (
              <Button key={size} variant={selectedSize === size ? 'default' : 'outline'} onClick={() => setSelectedSize(size)} className="w-14">
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center border border-border rounded-md w-fit">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={14}/></Button>
            <span className="w-10 text-center font-bold">{quantity}</span>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)} disabled={quantity >= stock}><Plus size={14}/></Button>
        </div>
        <div className="flex items-center gap-2 w-full">
            <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={!selectedVariant || stock <= 0}>
                <ShoppingBag size={20} className="mr-2" /> Add to Bag
            </Button>
             <Button variant="ghost" size="icon" onClick={handleWishlistToggle} className={cn("border", isWishlisted ? 'bg-destructive/20 text-destructive border-destructive' : '')}>
                <Heart size={20} className={cn(isWishlisted ? 'fill-current' : '')} />
            </Button>
        </div>
      </div>
      <Button size="lg" className="w-full" onClick={handleBuyNow} disabled={!selectedVariant || stock <= 0}>Buy Now</Button>

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

      <TrustBadges />
      <SizeGuideDialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen} />

    </div>
  );
}
