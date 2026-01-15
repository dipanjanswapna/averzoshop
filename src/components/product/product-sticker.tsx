
'use client';

import React from 'react';
import Barcode from 'react-barcode';
import type { Product, ProductVariant } from '@/types/product';

interface ProductStickerProps {
  product: Product;
  variant: ProductVariant;
}

export const ProductSticker = React.forwardRef<HTMLDivElement, ProductStickerProps>(({ product, variant }, ref) => {
  return (
    <div ref={ref} className="p-4 border border-dashed border-black w-[300px] font-sans bg-white">
      <div className="text-center space-y-1">
        <p className="text-sm font-bold uppercase text-black">{product.brand}</p>
        <p className="text-xs text-black">{product.name}</p>
        {(variant.color || variant.size) && (
             <p className="text-xs font-semibold text-black">
                {variant.color}{variant.color && variant.size && ' / '}{variant.size}
            </p>
        )}
        <p className="text-lg font-bold text-black">৳{variant.price.toFixed(2)}</p>
        <div className="flex justify-center pt-2">
            <Barcode 
                value={variant.sku}
                width={1.5}
                height={40}
                fontSize={12}
                margin={0}
            />
        </div>
      </div>
    </div>
  );
});

ProductSticker.displayName = 'ProductSticker';
