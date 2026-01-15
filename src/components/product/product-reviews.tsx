
'use client';
import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Camera } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const reviews = [
    {
        id: 1,
        author: 'Samin Yasar',
        rating: 5,
        date: '2 weeks ago',
        text: 'Absolutely love this t-shirt! The fabric is soft and comfortable, and the fit is perfect. Highly recommend it.',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
        helpful: 12,
        unhelpful: 1,
    },
    {
        id: 2,
        author: 'Jane Doe',
        rating: 4,
        date: '1 month ago',
        text: 'Good quality product, but the color was slightly different from what I saw online. Still happy with the purchase.',
        images: [],
        helpful: 8,
        unhelpful: 0,
    },
];

const ratingDistribution = [
    { star: 5, count: 82 },
    { star: 4, count: 10 },
    { star: 3, count: 3 },
    { star: 2, count: 1 },
    { star: 1, count: 4 },
];

export function ProductReviews() {
    const totalReviews = ratingDistribution.reduce((acc, item) => acc + item.count, 0);
    const averageRating = (ratingDistribution.reduce((acc, item) => acc + item.star * item.count, 0) / totalReviews).toFixed(1);

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
                            <Progress value={(count / totalReviews) * 100} className="w-full h-2" />
                            <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-bold">Customer Reviews ({reviews.length})</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Sort by: Most Recent</Button>
                    <Button variant="primary" size="sm">Write a Review</Button>
                </div>
            </div>

            <div className="space-y-6">
                {reviews.map(review => (
                    <div key={review.id} className="border-t pt-6">
                        <div className="flex items-start gap-4">
                             <Avatar>
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${review.author}`} />
                                <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{review.author}</p>
                                        <p className="text-xs text-muted-foreground">{review.date}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                                {review.images.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {review.images.map((img, i) => (
                                            <div key={i} className="relative h-20 w-20 rounded-md overflow-hidden">
                                                <Image src={img} alt="review image" fill className="object-cover"/>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                    <span>Was this helpful?</span>
                                    <button className="flex items-center gap-1 hover:text-primary"><ThumbsUp size={14} /> ({review.helpful})</button>
                                    <button className="flex items-center gap-1 hover:text-destructive"><ThumbsDown size={14} /> ({review.unhelpful})</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
