'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface WishlistButtonProps extends Omit<ButtonProps, 'onClick'> {
  productId: string;
}

export function WishlistButton({ productId, className, ...props }: WishlistButtonProps) {
  const { user, userData, firestore } = useAuth();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(!!userData?.wishlist?.includes(productId));
  }, [userData, productId]);

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'You need an account to manage your wishlist.' });
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(firestore, 'users', user.uid);

    try {
      if (isWishlisted) {
        await updateDoc(userDocRef, { wishlist: arrayRemove(productId) });
        toast({ title: 'Removed from wishlist' });
      } else {
        await updateDoc(userDocRef, { wishlist: arrayUnion(productId) });
        toast({ title: 'Added to wishlist' });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const tooltipContent = isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';

  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button onClick={handleToggle} disabled={isLoading} className={className} {...props}>
                <Heart className={cn('transition-colors', isWishlisted ? 'fill-destructive text-destructive' : 'text-current')} />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>{tooltipContent}</p>
        </TooltipContent>
    </Tooltip>
  );
}
