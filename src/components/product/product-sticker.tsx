'use client';

import React from 'react';
import Barcode from 'react-barcode';
import type { Product, ProductVariant } from '@/types/product';

interface ProductStickerProps {
  product: Product;
  variant: ProductVariant;
}

export function ProductSticker({ product, variant }: ProductStickerProps) {
  return (
    <div className="p-4 border border-dashed border-black w-[300px] font-sans bg-white text-black">
      <div className="text-center space-y-1">
        <p className="text-sm font-bold uppercase">{product.brand}</p>
        <p className="text-xs">{product.name}</p>
        {(variant.color || variant.size) && (
             <p className="text-xs font-semibold">
                {variant.color}{variant.color && variant.size && ' / '}{variant.size}
            </p>
        )}
        <p className="text-lg font-bold">৳{variant.price.toFixed(2)}</p>
        <div className="flex justify-center pt-2">
            <Barcode 
                value={variant.sku}
                width={1.5}
                height={40}
                fontSize={12}
                margin={0}
                background="transparent"
            />
        </div>
      </div>
    </div>
  );
}
