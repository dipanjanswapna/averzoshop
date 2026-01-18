'use client';

import type { Product } from '@/types/product';
import { useMemo } from 'react';
import { ProductCard } from '../product-card';

export const FlashSaleProductCard = ({ product }: { product: Product }) => {
  const { defaultVariant } = useMemo(() => {
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants ? Object.values(product.variants) : [];
    const determinedVariant = variantsArray.find(v => v.stock > 0) || variantsArray[0];
    return { defaultVariant: determinedVariant };
  }, [product]);

  return <ProductCard product={product} />;
};
