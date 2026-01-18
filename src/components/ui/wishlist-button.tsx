'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Wishlist } from '@/types/wishlist';

interface AddToWishlistPopoverProps extends Omit<ButtonProps, 'onClick'> {
  productId: string;
}

export function WishlistButton({ productId, className, ...props }: AddToWishlistPopoverProps) {
  const { user, userData, firestore } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const isWishlisted = useMemo(() => {
      return !!userData?.wishlists?.some(list => list.items.some(item => item.productId === productId));
  }, [userData, productId]);

  const handleUpdateWishlists = async (updatedWishlists: Wishlist[]) => {
      if (!user || !firestore) return false;
      setIsLoading(true);
      const userRef = doc(firestore, 'users', user.uid);
      try {
          await updateDoc(userRef, { wishlists: updatedWishlists });
          return true;
      } catch (err) {
          console.error(err);
          toast({ variant: 'destructive', title: 'Something went wrong' });
          return false;
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleSelectList = async (wishlistId: string) => {
    if (!user || !userData) return;
    const currentWishlists = userData.wishlists || [];

    const list = currentWishlists.find(w => w.id === wishlistId);
    if (list && list.items.some(i => i.productId === productId)) {
      toast({ title: "Already in this list" });
      return;
    }

    const updatedWishlists = currentWishlists.map(w => {
      if (w.id === wishlistId) {
        return {
          ...w,
          items: [...w.items, { productId, addedAt: Timestamp.now() }],
          updatedAt: Timestamp.now(),
        };
      }
      return w;
    });

    if (await handleUpdateWishlists(updatedWishlists)) {
        toast({ title: `Added to ${list?.name}` });
        setIsOpen(false);
    }
  };

  const handleCreateAndAdd = async () => {
      if (!user || !newListName.trim()) return;
      const currentWishlists = userData?.wishlists || [];
      
      const newWishlist: Wishlist = {
          id: Date.now().toString(),
          name: newListName,
          isPublic: false,
          items: [{ productId, addedAt: Timestamp.now() }],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
      };

      if (await handleUpdateWishlists([...currentWishlists, newWishlist])) {
          toast({ title: `Created '${newListName}' and added product.` });
          setNewListName('');
          setIsOpen(false);
      }
  };


  if (!user) {
    return (
      <Button className={className} {...props} onClick={() => toast({ variant: 'destructive', title: 'Please log in' })}>
        <Heart />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className={className} {...props}>
          <Heart className={cn('transition-colors', isWishlisted ? 'fill-destructive text-destructive' : 'text-current')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2">
        <div className="space-y-2">
            <h4 className="font-medium text-center text-sm">Add to Wishlist</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
                {userData?.wishlists?.map(list => (
                    <Button key={list.id} variant="ghost" className="w-full justify-start" onClick={() => handleSelectList(list.id)}>
                        {list.name}
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
                <Input 
                    placeholder="New list name..." 
                    className="h-8"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                />
                <Button size="icon" className="h-8 w-8" onClick={handleCreateAndAdd} disabled={!newListName.trim()}><Plus size={16}/></Button>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
