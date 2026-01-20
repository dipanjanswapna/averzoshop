'use client';

import { useAuth } from '@/hooks/use-auth';
import { PremiumCard } from '@/components/customer/premium-card';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Star, Printer } from 'lucide-react';

const tiers = [
  {
    name: 'Silver',
    price: 'Free',
    features: ['Basic access', '5 points per ৳100 spent', 'Standard support'],
    cta: 'Your Current Plan',
    current: true,
  },
  {
    name: 'Gold',
    price: '৳499/year',
    features: ['Everything in Silver', '7 points per ৳100 spent', 'Early access to sales', 'Priority support'],
    cta: 'Upgrade to Gold',
    current: false,
  },
  {
    name: 'Platinum',
    price: '৳999/year',
    features: ['Everything in Gold', '10 points per ৳100 spent', 'Exclusive offers & gifts', '24/7 dedicated support'],
    cta: 'Upgrade to Platinum',
    current: false,
  },
];

export default function SubscriptionPage() {
  const { userData, loading } = useAuth();
  
  const handlePrint = () => {
    window.print();
  };

  if (loading || !userData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="w-full max-w-lg aspect-[8/5]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  const userTier = userData.membershipTier || 'silver';

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 no-print">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">My Subscription</h1>
                <p className="text-muted-foreground text-sm">View your membership details and benefits.</p>
            </div>
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" /> Print Card
            </Button>
        </div>

        <PremiumCard userData={userData} />

        <Card className="no-print">
            <CardHeader>
                <CardTitle>Membership Tiers</CardTitle>
                <CardDescription>Explore the benefits of each membership level.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map(tier => (
                    <Card key={tier.name} className={`flex flex-col ${tier.name.toLowerCase() === userTier ? 'border-primary border-2 shadow-lg' : ''}`}>
                        <CardHeader className="p-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-xl">{tier.name} <Star className={tier.name.toLowerCase() === 'gold' ? 'text-yellow-500' : tier.name.toLowerCase() === 'platinum' ? 'text-blue-500' : 'text-gray-400'} /></CardTitle>
                                {tier.name.toLowerCase() === userTier && <span className="text-xs font-bold text-primary">CURRENT</span>}
                            </div>
                            <CardDescription className="text-lg font-bold">{tier.price}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            <ul className="space-y-2 text-xs">
                            {tier.features.map(feature => (
                                <li key={feature} className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-4">
                            <Button disabled={tier.name.toLowerCase() === userTier} className="w-full">
                                {tier.name.toLowerCase() === userTier ? 'Your Current Plan' : `Upgrade to ${tier.name}`}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </div>
      <div className="printable-area">
        <PremiumCard userData={userData} />
      </div>
    </>
  );
}
