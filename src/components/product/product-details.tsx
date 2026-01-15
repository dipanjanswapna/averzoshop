
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { products } from '@/lib/data';
import { TrustBadges } from './trust-badges';
import Link from 'next/link';

type Product = (typeof products)[0];

export function ProductDetails({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes.length > 0 ? product.sizes[0] : null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors.length > 0 ? product.colors[0] : null);
  const [quantity, setQuantity] = useState(1);
  
  const originalPrice = product.price / (1 - product.discount / 100);
  const stockStatus = product.stock > 10 ? 'In Stock' : `Only ${product.stock} left!`;
  const stockColor = product.stock > 10 ? 'text-green-600' : 'text-orange-600';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-medium text-primary uppercase">{product.group}</span>
        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline text-foreground mt-1">{product.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>By <Link href="#" className="text-primary font-semibold hover:underline">{product.brand}</Link></span>
            <span className="h-4 border-l border-border"></span>
            <span>SKU: {product.id.toUpperCase()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
         <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary font-roboto">৳{product.price.toFixed(2)}</span>
          {product.discount > 0 && (
             <span className="text-lg text-muted-foreground line-through font-roboto">৳{originalPrice.toFixed(2)}</span>
          )}
        </div>
        <div className={cn("text-sm font-semibold", stockColor)}>
          {stockStatus}
        </div>
      </div>
      
      {product.colors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">Color</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                )}
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(size => (
              <Button
                key={size}
                variant={selectedSize === size ? 'default' : 'outline'}
                onClick={() => setSelectedSize(size)}
                className="w-14"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-8">
        <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground">Quantity</h3>
            <div className="flex items-center border border-border rounded-md w-fit">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={14}/></Button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus size={14}/></Button>
            </div>
        </div>
      </div>
      
       <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" variant="outline" className="w-full">
            <ShoppingBag size={20} className="mr-2" /> Add to Bag
          </Button>
          <Button size="lg" className="w-full">Buy Now</Button>
      </div>

      <TrustBadges />

    </div>
  );
}
