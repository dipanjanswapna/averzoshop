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
  },
  {
    name: 'Gold',
    price: '৳499/year',
    features: ['Everything in Silver', '7 points per ৳100 spent', 'Early access to sales', 'Priority support'],
  },
  {
    name: 'Platinum',
    price: '৳999/year',
    features: ['Everything in Gold', '10 points per ৳100 spent', 'Exclusive offers & gifts', '24/7 dedicated support'],
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
        <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-sm">
                <Skeleton className="w-full aspect-[1.586/1] rounded-2xl" />
            </div>
             <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }
  
  const userTier = userData.membershipTier || 'silver';
  
  const upgradeTiers = tiers.filter(tier => {
      if (userTier === 'silver') return tier.name === 'Gold' || tier.name === 'Platinum';
      if (userTier === 'gold') return tier.name === 'Platinum';
      return false;
  });


  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 no-print">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">My Subscription</h1>
                <p className="text-muted-foreground text-sm">View your membership details and benefits.</p>
            </div>
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" /> Print Card
            </Button>
        </div>

        <div className="flex flex-col gap-12 items-center">
            <div className="w-full">
                <PremiumCard userData={userData} />
            </div>

            <div className="w-full max-w-4xl no-print">
                {upgradeTiers.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Upgrade Your Membership</CardTitle>
                            <CardDescription>Explore the benefits of the next membership levels.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {upgradeTiers.map(tier => (
                                <Card key={tier.name} className="flex flex-col">
                                    <CardHeader className="p-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-xl">{tier.name} <Star className="text-primary" /></CardTitle>
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
                                        <Button className="w-full">
                                            {`Upgrade to ${tier.name}`}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                     <div className="h-full flex items-center justify-center">
                        <div className="bg-card p-8 rounded-2xl text-center shadow-lg border">
                            <Star className="mx-auto h-12 w-12 text-primary" />
                            <h3 className="mt-4 text-xl font-bold text-foreground">Congratulations!</h3>
                            <p className="mt-2 text-sm text-muted-foreground">You are at our highest membership tier. Thank you for your loyalty!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
       <div className="printable-card-area">
        <PremiumCard userData={userData} />
      </div>
    </>
  );
}
