'use client';

import { useAuth } from '@/hooks/use-auth';
import { useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { PremiumCard } from '@/components/customer/premium-card';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Star, Printer, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoyaltySettings {
    pointsPer100Taka?: { silver: number; gold: number; platinum: number; };
    tierThresholds?: { gold: number; platinum: number; };
}

export default function SubscriptionPage() {
  const { userData, loading: authLoading } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useFirestoreDoc<LoyaltySettings>('settings/loyalty');
  
  const handlePrint = () => {
    window.print();
  };

  const isLoading = authLoading || settingsLoading;

  if (isLoading || !userData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-sm">
                <Skeleton className="w-full aspect-[1.586/1] rounded-2xl" />
            </div>
             <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }
  
  const userTier = userData.membershipTier || 'silver';
  const totalSpent = userData.totalSpent || 0;

  const tiers = [
    {
      name: 'Silver',
      spendRequired: 0,
      features: [`Basic access`, `${settings?.pointsPer100Taka?.silver ?? 5} points per ৳100 spent`, `Standard support`],
      isCurrentUserTier: userTier === 'silver',
    },
    {
      name: 'Gold',
      spendRequired: settings?.tierThresholds?.gold ?? 5000,
      features: [`Everything in Silver`, `${settings?.pointsPer100Taka?.gold ?? 7} points per ৳100 spent`, `Early access to sales`, `Priority support`],
      isCurrentUserTier: userTier === 'gold',
    },
    {
      name: 'Platinum',
      spendRequired: settings?.tierThresholds?.platinum ?? 15000,
      features: [`Everything in Gold`, `${settings?.pointsPer100Taka?.platinum ?? 10} points per ৳100 spent`, `Exclusive offers & gifts`, `24/7 dedicated support`],
      isCurrentUserTier: userTier === 'platinum',
    },
  ];

  const currentTierIndex = tiers.findIndex(t => t.isCurrentUserTier);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

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

            <div className="w-full max-w-5xl no-print">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline">Membership Tiers & Benefits</CardTitle>
                        <CardDescription>See how you can get more out of your Averzo membership.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {tiers.map(tier => (
                            <Card key={tier.name} className={`flex flex-col ${tier.isCurrentUserTier ? 'border-primary ring-2 ring-primary' : ''}`}>
                                <CardHeader className="p-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            {tier.name === 'Gold' && <Star className="text-amber-500" />}
                                            {tier.name === 'Platinum' && <Award className="text-blue-500" />}
                                            {tier.name}
                                        </CardTitle>
                                        {tier.isCurrentUserTier && <Badge>Your Tier</Badge>}
                                    </div>
                                    <CardDescription className="text-lg font-bold">
                                      Spend ৳{tier.spendRequired.toLocaleString()}
                                    </CardDescription>
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
                            </Card>
                        ))}
                    </CardContent>
                    <CardFooter className="flex-col items-center p-6">
                        {nextTier ? (
                          <>
                            <p className="text-sm font-bold">You are ৳{(nextTier.spendRequired - totalSpent).toLocaleString()} away from {nextTier.name}!</p>
                            <Progress value={(totalSpent / (nextTier.spendRequired || 1)) * 100} className="w-full h-3 mt-2" />
                            <div className="w-full flex justify-between text-xs text-muted-foreground mt-1">
                                <span>৳{totalSpent.toLocaleString()}</span>
                                <span>৳{nextTier.spendRequired.toLocaleString()}</span>
                            </div>
                          </>
                        ) : (
                           <div className="h-full flex items-center justify-center text-center">
                                <div className="p-4 rounded-2xl">
                                    <Star className="mx-auto h-12 w-12 text-primary" />
                                    <h3 className="mt-4 text-xl font-bold text-foreground">Congratulations!</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">You are at our highest membership tier. Thank you for your loyalty!</p>
                                </div>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
       <div className="printable-card-area">
        <PremiumCard userData={userData} />
      </div>
    </>
  );
}
