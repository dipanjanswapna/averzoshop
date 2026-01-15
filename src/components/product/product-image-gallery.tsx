
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { products } from '@/lib/data';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';


type Product = (typeof products)[0];

export function ProductImageGallery({ product }: { product: Product }) {
  const [activeMedia, setActiveMedia] = useState({ type: 'image', src: product.image });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const allMedia = [
    { type: 'image', src: product.image },
    ...(product.gallery?.map(src => ({ type: 'image', src })) || []),
    ...(product.videos?.map(src => ({ type: 'video', src })) || [])
  ];

  const isOutOfStock = product.total_stock <= 0;

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
            hover: { scale: 1.2 },
          }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={activeMedia.src}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>
        
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white text-destructive font-bold text-lg px-6 py-3 rounded-md uppercase tracking-widest -rotate-12 border-2 border-destructive">
              Out of Stock
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
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
            <Image src={media.type === 'video' ? `https://img.youtube.com/vi/${media.src.split('embed/')[1]}/0.jpg` : media.src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
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
