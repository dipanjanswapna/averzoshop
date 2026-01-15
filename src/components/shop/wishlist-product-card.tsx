
'use client';

import Image from 'next/image';
import { ShoppingBag, X } from 'lucide-react';
import type { products } from '@/lib/data';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase/auth/use-auth.tsx';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';


type Product = (typeof products)[0];

export const WishlistProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user, firestore } = useAuth();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Please login",
        description: "You need to be logged in to manage your wishlist.",
      });
      return;
    }
    const userWishlistRef = doc(firestore, "users", user.uid);
    try {
      await updateDoc(userWishlistRef, {
        wishlist: arrayRemove(product.id)
      });
      toast({ title: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({ variant: "destructive", title: "Could not update wishlist" });
    }
  };

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image && (
              <Image
              src={product.image}
              alt={product.name}
              fill
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold truncate">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-primary">৳{product.price.toFixed(2)}</span>
          </div>
        </div>
      </Link>
      
      <div className="p-3 pt-0 flex flex-col gap-2">
        <Button onClick={handleAddToCart} size="sm" className="w-full">
          <ShoppingBag size={16} className="mr-2" /> Add to Bag
        </Button>
      </div>

       <Button onClick={handleRemoveFromWishlist} variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-card/50 backdrop-blur-sm text-card-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-full">
            <X size={14} />
      </Button>
    </div>
  );
};

