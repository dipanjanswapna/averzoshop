
'use client';

import Image from 'next/image';
import { Heart, ShoppingBag, Eye, MapPin } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

export const ProductCard = ({ product }: { product: Product }) => {
  const finalPrice = product.price;
  const originalPrice = product.compareAtPrice;
  
  const stock = product.total_stock;
  const stockStatus = stock > 0 && stock < 10 ? 'Low Stock' : null;

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const defaultVariant = product.variants?.find(v => v.stock > 0) || product.variants?.[0];
    if (!defaultVariant) {
        toast({
          variant: "destructive",
          title: 'Product Unavailable',
          description: 'This product has no available variants.',
        });
        return;
    }

    addItem(product, defaultVariant);
  };

  return (
    <Link href={`/product/${product.id}`} className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block">
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image && (
            <Image
            src={product.image}
            alt={product.name}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="bg-black/80 text-white text-[9px] font-saira px-2 py-0.5 rounded-full uppercase">{product.group}</span>
          {product.discount > 0 && (
            <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">{Math.round(product.discount)}% OFF</span>
          )}
          {stockStatus && (
             <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">{stockStatus}</span>
          )}
        </div>

        {/* Hover Actions (Hidden on Mobile, Visible on Desktop Hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="p-2 bg-card rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            <Heart size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="p-2 bg-card rounded-full text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            <Eye size={16} />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 bg-card text-card-foreground">
        <h4 className="text-muted-foreground text-[9px] font-roboto uppercase tracking-wider">{product.brand}</h4>
        <h3 className="text-xs font-noto font-semibold truncate">{product.name}</h3>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-primary font-roboto">৳{finalPrice.toFixed(2)}</span>
          {originalPrice && originalPrice > finalPrice && (
            <span className="text-[10px] text-muted-foreground line-through">৳{originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Phygital Indicator & Rating */}
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
          <div className="flex items-center text-green-500 gap-1">
            <MapPin size={10} />
            <span className="text-[9px] font-medium">In Store</span>
          </div>
          <div className="flex items-center text-yellow-500">
            <span className="text-[9px] font-bold">4.5★</span>
          </div>
        </div>

        {/* Quick Add Button (Mobile Friendly) */}
        <Button onClick={handleAddToCart} className="w-full mt-2 flex items-center justify-center gap-2 bg-foreground text-background py-2 rounded-lg text-[10px] font-bold hover:bg-primary hover:text-primary-foreground transition-colors" disabled={stock <= 0}>
          {stock > 0 ? (
            <>
              <ShoppingCart size={12} />
              ADD TO CART
            </>
          ) : (
            'Out of Stock'
          )}
        </Button>
      </div>
    </Link>
  );
};
