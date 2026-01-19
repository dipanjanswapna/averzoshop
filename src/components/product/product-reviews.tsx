
'use client';
import { useState, useMemo } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import type { Review } from '@/types/review';
import type { Order } from '@/types/order';
import { Skeleton } from '../ui/skeleton';
import { WriteReviewDialog } from './write-review-dialog';
import { collection, query, where, orderBy } from 'firebase/firestore';

interface ProductReviewsProps {
    productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const { user, firestore } = useAuth();
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

    const reviewsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, `products/${productId}/reviews`), orderBy('createdAt', 'desc'));
    }, [firestore, productId]);
    
    const userOrdersQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'orders'), where('customerId', '==', user.uid));
    }, [firestore, user]);

    const { data: reviews, isLoading: reviewsLoading } = useFirestoreQuery<Review>(reviewsQuery);
    const { data: userOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(userOrdersQuery);

    const canReview = useMemo(() => {
        if (!user || !userOrders) return false;
        return userOrders.some(order => 
            (order.status === 'delivered' || order.status === 'fulfilled') &&
            order.items.some(item => item.productId === productId)
        );
    }, [user, userOrders, productId]);
    
    const hasAlreadyReviewed = useMemo(() => {
        if (!user || !reviews) return false;
        return reviews.some(review => review.userId === user.uid);
    }, [user, reviews]);

    const ratingDistribution = useMemo(() => {
        const dist = [
            { star: 5, count: 0 }, { star: 4, count: 0 }, { star: 3, count: 0 }, { star: 2, count: 0 }, { star: 1, count: 0 },
        ];
        if (!reviews) return dist;
        reviews.forEach(review => {
            const index = 5 - review.rating;
            if (index >= 0 && index < 5) {
                dist[index].count++;
            }
        });
        return dist;
    }, [reviews]);
    
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
        ? (reviews!.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1)
        : '0.0';
    
    const isLoading = reviewsLoading || ordersLoading;

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center justify-center space-y-2 border-r-0 md:border-r pr-0 md:pr-8">
                    <p className="text-muted-foreground">Average Rating</p>
                    <p className="text-5xl font-bold">{averageRating}</p>
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-6 w-6 ${i < Math.round(Number(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground">({totalReviews} reviews)</p>
                </div>
                <div className="col-span-2 space-y-2">
                     {ratingDistribution.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-4">
                            <span className="text-sm font-medium w-12">{star} star</span>
                            <Progress value={(count / (totalReviews || 1)) * 100} className="w-full h-2" />
                            <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-bold">Customer Reviews ({reviews?.length || 0})</h3>
                {canReview && !hasAlreadyReviewed && (
                    <Button onClick={() => setIsReviewDialogOpen(true)}>Write a Review</Button>
                )}
            </div>

            <div className="space-y-6">
                {reviews && reviews.length > 0 ? reviews.map(review => (
                    <div key={review.id} className="border-t pt-6">
                        <div className="flex items-start gap-4">
                             <Avatar>
                                <AvatarImage src={review.userAvatar || ''} />
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{review.userName}</p>
                                        <p className="text-xs text-muted-foreground">{review.createdAt?.toDate().toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Reviews Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Be the first to share your thoughts on this product.</p>
                    </div>
                )}
            </div>
            <WriteReviewDialog 
                open={isReviewDialogOpen} 
                onOpenChange={setIsReviewDialogOpen} 
                productId={productId}
            />
        </div>
    );
}
