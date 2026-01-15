
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem as CartItemType } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';


interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-start gap-4 border-b pb-6 last:border-b-0 last:pb-0">
      <Link href={`/product/${product.id}`} className="flex-shrink-0">
        <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <div className="flex-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm hover:text-primary">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
            {product.colors.length > 0 && `Color: ${product.colors[0]}`}
            {product.colors.length > 0 && product.sizes.length > 0 && ' / '}
            {product.sizes.length > 0 && `Size: ${product.sizes[0]}`}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border rounded-md w-fit">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus size={14} />
            </Button>
            <span className="w-8 text-center text-sm font-bold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(product.id, quantity + 1)}
            >
              <Plus size={14} />
            </Button>
          </div>
          <div className="text-right">
              <p className="font-bold text-base text-primary">৳{(product.price * quantity).toFixed(2)}</p>
               {quantity > 1 && (
                 <p className="text-xs text-muted-foreground">৳{product.price.toFixed(2)} each</p>
               )}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        onClick={() => removeItem(product.id)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
