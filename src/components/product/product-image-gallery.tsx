
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { products } from '@/lib/data';

type Product = (typeof products)[0];

const mockImages = [
  'https://images.unsplash.com/photo-1759572095329-1dcf9522762b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0LXNoaXJ0JTIwZmFzaGlvbnxlbnwwfHx8fDE3NjgzNTg1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0LXNoaXJ0JTIwZmFzaGlvbnxlbnwwfHx8fDE3NjgzNTg1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHx0LXNoaXJ0JTIwZmFzaGlvbnxlbnwwfHx8fDE3NjgzNTg1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx0LXNoaXJ0JTIwZmFzaGlvbnxlbnwwfHx8fDE3NjgzNTg1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
];


export function ProductImageGallery({ product }: { product: Product }) {
  const images = [product.image || mockImages[0], ...mockImages.slice(1)];
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4 sticky top-28">
      <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border">
        <Image src={mainImage} alt={product.name} fill className="object-cover" />
        {product.discount > 0 && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={cn(
              "relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all",
              mainImage === img ? 'border-primary ring-2 ring-primary/50' : 'border-border'
            )}
          >
            <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
