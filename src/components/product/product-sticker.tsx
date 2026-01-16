'use client';

import React from 'react';
import Barcode from 'react-barcode';
import type { Product, ProductVariant } from '@/types/product';

interface ProductStickerProps {
  product: Product;
  variant: ProductVariant;
}

export function ProductSticker({ product, variant }: ProductStickerProps) {
  const displayPrice = variant.price ?? product.price;
  
  return (
    <div className="p-2 border border-dashed border-black w-60 font-sans bg-white text-black">
      <div className="text-center space-y-1">
        <p className="text-xs font-bold uppercase">{product.brand}</p>
        <p className="text-[10px] leading-tight">{product.name}</p>
        {(variant.color || variant.size) && (
             <p className="text-[10px] font-semibold">
                {variant.color}{variant.color && variant.size && ' / '}{variant.size}
            </p>
        )}
        <p className="text-base font-bold">৳{displayPrice.toFixed(2)}</p>
        <div className="flex justify-center pt-1">
            <Barcode 
                value={variant.sku}
                width={1.2}
                height={30}
                fontSize={10}
                margin={0}
                background="transparent"
            />
        </div>
      </div>
    </div>
  );
}
