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
    <div className="p-2 border border-dotted border-black w-60 font-sans bg-white text-black">
      <div className="text-center space-y-0.5 flex flex-col items-center">
        <p className="text-sm font-bold uppercase">{product.brand}</p>
        <p className="text-xs leading-tight">{product.name}</p>
        {(variant.color || variant.size) && (
             <p className="text-xs">
                {variant.color}{variant.color && variant.size && ' / '}{variant.size}
            </p>
        )}
        <p className="text-lg font-bold">৳{displayPrice.toFixed(2)}</p>
        <div className="pt-1">
            <Barcode 
                value={variant.sku}
                width={1.2}
                height={30}
                fontSize={10}
                margin={0}
                background="transparent"
                displayValue={true}
                font="monospace"
                textAlign="center"
            />
        </div>
        {product.giftWithPurchase?.enabled && (
          <p className="text-xs font-bold text-red-600 pt-1">Free Gift with Purchase!</p>
        )}
      </div>
    </div>
  );
}
