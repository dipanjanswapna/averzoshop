
'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProductCard } from '../product-card';

export const FlashSaleProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const { defaultVariant } = useMemo(() => {
    const variantsArray = Array.isArray(product.variants)
      ? product.variants
      : product.variants ? Object.values(product.variants) : [];
    const determinedVariant = variantsArray.find(v => v.stock > 0) || variantsArray[0];
    return { defaultVariant: determinedVariant };
  }, [product]);

  return <ProductCard product={product} />;
};
