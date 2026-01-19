
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export function WriteReviewDialog({ open, onOpenChange, productId }: WriteReviewDialogProps) {
  const { toast } = useToast();
  const { user, firestore } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Please log in' });
      return;
    }
    if (rating === 0) {
        toast({ variant: 'destructive', title: 'Rating required', description: 'Please select a star rating.' });
        return;
    }
     if (!reviewText.trim()) {
        toast({ variant: 'destructive', title: 'Review cannot be empty.' });
        return;
    }

    setIsLoading(true);
    try {
      const reviewsRef = collection(firestore, `products/${productId}/reviews`);
      await addDoc(reviewsRef, {
        productId,
        rating,
        text: reviewText,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      setRating(0);
      setReviewText('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your review.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your thoughts about this product with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        return (
                            <Star
                                key={starValue}
                                size={28}
                                className={cn("cursor-pointer transition-colors", starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                            />
                        )
                    })}
                </div>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                placeholder="What did you like or dislike?"
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
