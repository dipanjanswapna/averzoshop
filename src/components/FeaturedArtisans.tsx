'use client';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { UserData } from '@/types/user';
import { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function FeaturedArtisans() {
    const { data: users, isLoading } = useFirestoreQuery<UserData>('users');

    const artisans = useMemo(() => {
        if (!users) return [];
        return users.filter(u => u.role === 'artisan' && u.status === 'approved').slice(0, 4);
    }, [users]);
    
    if (isLoading) {
        return (
            <section className="py-16 md:py-24 bg-background">
                <div className="container">
                    <h2 className="font-headline text-3xl font-extrabold text-center mb-2">Meet Our Artisans</h2>
                    <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">Discover unique products handcrafted with passion and skill by our talented artisans.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <Skeleton className="h-32 w-32 rounded-full" />
                                <Skeleton className="h-6 w-32 mt-4" />
                                <Skeleton className="h-4 w-48 mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }
    
    if (artisans.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-background">
            <div className="container">
                <h2 className="font-headline text-3xl font-extrabold text-center mb-2">Meet Our Artisans</h2>
                <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">Discover unique products handcrafted with passion and skill by our talented artisans.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {artisans.map(artisan => (
                        <Link href={`/artisan/${artisan.uid}`} key={artisan.uid} className="group block">
                            <Card className="overflow-hidden text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 h-full flex flex-col">
                                <div className="relative h-40 bg-muted">
                                    {artisan.coverPhotoURL ? (
                                        <Image src={artisan.coverPhotoURL} alt={`${artisan.displayName}'s work`} fill className="object-cover" />
                                    ) : (
                                         <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100"></div>
                                    )}
                                     <div className="absolute inset-0 bg-black/10"></div>
                                </div>
                                <CardContent className="p-6 flex-1 flex flex-col items-center">
                                    <Avatar className="-mt-16 h-24 w-24 border-4 border-background shadow-md">
                                        <AvatarImage src={artisan.photoURL || undefined} alt={artisan.displayName || ''} />
                                        <AvatarFallback>{artisan.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-bold font-headline mt-4 text-lg">{artisan.displayName}</h3>
                                    <p className="text-xs text-muted-foreground flex-grow">{artisan.bio ? `"${artisan.bio.substring(0, 50)}${artisan.bio.length > 50 ? '...' : ''}"` : 'Passionate creator of unique crafts.'}</p>
                                    <div className="mt-4 text-primary text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Store <ArrowRight size={12} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
