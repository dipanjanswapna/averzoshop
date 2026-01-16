
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoyaltyDashboard } from '@/components/customer/LoyaltyDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerDashboardPage() {
    const { user, userData, loading } = useAuth();
    
    if (loading || !userData) {
        return (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                 </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                 </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.displayName || 'Customer'}!</h1>
            <p className="text-muted-foreground">Here's a quick overview of your account and loyalty status.</p>

            <LoyaltyDashboard userData={userData} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>View and edit your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/customer/profile">
                            <Button>Go to Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>My Orders</CardTitle>
                        <CardDescription>Track your recent and past orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/customer/my-orders">
                            <Button>View Orders</Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>My Wishlist</CardTitle>
                        <CardDescription>See all the products you've saved.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/customer/my-wishlist">
                            <Button>View Wishlist</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
