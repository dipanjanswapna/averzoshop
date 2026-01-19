'use client';

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Product, ProductVariant } from '@/types/product';
import { ProductImageGallery } from '../product/product-image-gallery';
import { ProductDetails } from '../product/product-details';
import { useState, useEffect } from 'react';

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (product) {
      const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
      const initialVariant = variantsArray.find(v => (v.stock || 0) > 0) || variantsArray[0] || null;
      if (initialVariant) {
        setSelectedColor(initialVariant.color || null);
        setSelectedSize(initialVariant.size || null);
        setSelectedVariant(initialVariant);
      }
    } else {
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedVariant(null);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
    const uniqueColors = [...new Set(variantsArray.map(v => v.color).filter(Boolean))];
    const uniqueSizes = [...new Set(variantsArray.map(v => v.size).filter(Boolean))];

    const variant = variantsArray.find(v => {
        const colorMatch = uniqueColors.length === 0 || v.color === selectedColor;
        const sizeMatch = uniqueSizes.length === 0 || v.size === selectedSize;
        return colorMatch && sizeMatch;
    }) || null;
    setSelectedVariant(variant);
  }, [selectedColor, selectedSize, product]);

  if (!product) {
    return null;
  }
  
  const isOutOfStock = !product.preOrder?.enabled && (selectedVariant ? (selectedVariant.stock || 0) <= 0 : product.total_stock <= 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col sm:flex-row p-0">
        <div className="w-full sm:w-1/2 p-4">
           <ProductImageGallery product={product} selectedVariant={selectedVariant} />
        </div>
        <div className="w-full sm:w-1/2 p-6 overflow-y-auto">
            <ProductDetails
                product={product}
                selectedVariant={selectedVariant}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                isOutOfStock={isOutOfStock}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
