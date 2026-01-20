
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types/product';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';

interface ProductImageGalleryProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export function ProductImageGallery({ product, selectedVariant }: ProductImageGalleryProps) {
  const [activeMedia, setActiveMedia] = useState({ type: 'image', src: product.image });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allMedia = useMemo(() => {
    const mediaSet = new Map<string, { type: 'image' | 'video', src: string }>();
    
    // Add main product image
    if (product.image) mediaSet.set(product.image, { type: 'image', src: product.image });
    
    // Add gallery images
    product.gallery?.forEach(src => {
        if (src) mediaSet.set(src, { type: 'image', src });
    });

    // Add unique variant images
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants && typeof product.variants === 'object'
      ? Object.values(product.variants)
      : [];

    variantsArray.forEach(v => {
      if (v?.image) {
        mediaSet.set(v.image, { type: 'image', src: v.image });
      }
    });

    // Add videos
    product.videos?.forEach(src => {
        if (src) mediaSet.set(src, { type: 'video', src });
    });

    return Array.from(mediaSet.values());
  }, [product]);

  useEffect(() => {
    if (selectedVariant?.image) {
      setActiveMedia({ type: 'image', src: selectedVariant.image });
    } else {
      setActiveMedia({ type: 'image', src: product.image });
    }
  }, [selectedVariant, product.image]);
  
  const isOutOfStock = !product.preOrder?.enabled && (!selectedVariant || (selectedVariant.stock || 0) <= 0);
  
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

  return (
    <div className="flex flex-col gap-4 sticky top-28">
      <motion.div 
        className={cn(
          "relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border"
        )}
        whileHover="hover"
      >
        <motion.div
          className="w-full h-full"
           variants={{
            hover: activeMedia.type === 'image' ? { scale: 1.1 } : {},
          }}
          transition={{ duration: 0.3 }}
        >
          {activeMedia.type === 'video' ? (
              <iframe
                  className="w-full h-full"
                  src={getAutoplayUrl(activeMedia.src)}
                  title={product.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
          ) : (
            <Image
                src={activeMedia.src}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn("object-cover", "cursor-pointer")}
                onClick={() => setIsLightboxOpen(true)}
            />
          )}
        </motion.div>
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none">
            <div className="bg-destructive text-destructive-foreground font-bold text-lg px-6 py-3 rounded-md uppercase tracking-widest -rotate-12 border-2 border-destructive">
              Out of Stock
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.preOrder?.enabled && (
              <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Pre-Order
              </div>
            )}
            {product.isNew && <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</div>}
            {product.discount > 0 && !isOutOfStock && (
              <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                -{product.discount}% OFF
              </div>
            )}
            {product.isBestSeller && <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST SELLER</div>}
        </div>
      </motion.div>
      <div className="grid grid-cols-5 gap-2">
        {allMedia.map((media, index) => (
          <button
            key={index}
            onClick={() => setActiveMedia(media)}
            className={cn(
              "relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all",
              activeMedia.src === media.src ? 'border-primary ring-2 ring-primary/50' : 'border-border'
            )}
          >
            <Image src={media.type === 'video' ? getYouTubeThumbnail(media.src) : media.src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
            {media.type === 'video' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Youtube className="text-white h-8 w-8" />
                </div>
            )}
          </button>
        ))}
      </div>
       <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl h-auto p-0">
          <Image src={activeMedia.src} alt={product.name} width={1200} height={1200} className="w-full h-full object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
