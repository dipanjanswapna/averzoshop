'use client';

import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { useCompare } from '@/hooks/use-compare';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import type { Product } from '@/types/product';

interface CompareButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: Product;
}

export function CompareButton({ product, className, ...props }: CompareButtonProps) {
  const { items, addItem, removeItem } = useCompare();
  const [isInCompare, setIsInCompare] = useState(false);

  useEffect(() => {
    setIsInCompare(items.some(item => item.id === product.id));
  }, [items, product.id]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };
  
  const tooltipContent = isInCompare ? 'Remove from Compare' : 'Add to Compare';

  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button onClick={handleToggle} className={className} {...props}>
                <Layers className={cn('transition-colors', isInCompare ? 'fill-primary text-primary' : 'text-current')} />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>{tooltipContent}</p>
        </TooltipContent>
    </Tooltip>
  );
}
