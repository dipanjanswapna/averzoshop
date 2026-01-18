'use client';

import Image from 'next/image';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { useMemo } from 'react';
import { Star } from 'lucide-react';

export const FlashSaleProductCard = ({ product }: { product: Product }) => {

  const { defaultVariant, displayPrice, displayOriginalPrice } = useMemo(() => {
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants ? Object.values(product.variants) : [];

    const determinedVariant = variantsArray.find(v => (v.stock || 0) > 0) || variantsArray[0];
    
    const price = determinedVariant?.price ?? product.price;
    const originalPrice = determinedVariant?.compareAtPrice ?? product.compareAtPrice;

    return {
      defaultVariant: determinedVariant,
      displayPrice: price,
      displayOriginalPrice: originalPrice,
    };
  }, [product]);

  const discount = useMemo(() => {
    if (displayOriginalPrice && displayOriginalPrice > displayPrice) {
      return Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);
    }
    return 0;
  }, [displayPrice, displayOriginalPrice]);

  // Mock rating
  const rating = useMemo(() => (product.id.charCodeAt(0) % 3) + 3, [product.id]); // Random rating between 3 and 5

  return (
    <Link href={`/product/${product.id}`} className="group block bg-white rounded-xl p-4 text-center transition-shadow hover:shadow-lg h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-md mb-4 flex-shrink-0">
            <Image
                src={product.image}
                alt={product.name}
                fill
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {discount > 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                </div>
            )}
        </div>
        <div className="flex flex-col flex-grow justify-between">
          <h3 className="text-sm font-semibold truncate text-gray-800">{product.name}</h3>
          
          <div className="my-2 h-4">
            {product.name.includes("Realme Buds Wireless 5") && ( // Conditionally show stars for the one product in the image
              <div className="flex justify-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < rating ? 'fill-current' : ''} />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-center gap-2 mt-auto">
              <span className="text-lg font-bold text-red-600">৳{displayPrice.toFixed(2)}</span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <span className="text-sm text-gray-400 line-through">৳{displayOriginalPrice.toFixed(2)}</span>
              )}
          </div>
        </div>
    </Link>
  );
};
