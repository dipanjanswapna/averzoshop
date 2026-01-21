
'use client';
import { Award, Star, TrendingUp, History } from "lucide-react";
import type { UserData } from "@/types/user";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { Skeleton } from "../ui/skeleton";

interface LoyaltySettings {
    pointValueInTaka: number;
    tierThresholds: { gold: number; platinum: number };
}

export function LoyaltyDashboard({ userData }: { userData: UserData }) {
    const { data: settings, isLoading } = useFirestoreDoc<LoyaltySettings>('settings/loyalty');
    
    const pointValue = settings?.pointValueInTaka ?? 0.20;
    const goldThreshold = settings?.tierThresholds?.gold ?? 5000;
    const platinumThreshold = settings?.tierThresholds?.platinum ?? 15000;
    
    const pointsToCash = ((userData.loyaltyPoints || 0) * pointValue).toFixed(2);
    const totalSpent = userData.totalSpent || 0;

    const tiers = {
        silver: { name: 'Silver', next: 'Gold', spendToNext: goldThreshold },
        gold: { name: 'Gold', next: 'Platinum', spendToNext: platinumThreshold },
        platinum: { name: 'Platinum', next: null, spendToNext: Infinity },
    };

    const currentTier = tiers[userData.membershipTier || 'silver'];
    const spendProgress = currentTier.next ? (totalSpent / currentTier.spendToNext) * 100 : 100;
    const spendNeeded = currentTier.next ? currentTier.spendToNext - totalSpent : 0;
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
            </div>
        )
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Membership Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-300 text-sm uppercase tracking-widest">Membership Status</p>
          <h2 className="text-3xl font-black mt-1 flex items-center gap-2 capitalize">
            {currentTier.name} <Award className="text-yellow-400" />
          </h2>
          {currentTier.next && (
            <div className="mt-8">
              <p className="text-xs text-slate-400">Total Spent: ৳{totalSpent.toFixed(2)}</p>
              <div className="w-full bg-slate-600 h-2 mt-2 rounded-full">
                <div className="bg-yellow-400 h-full rounded-full" style={{width: `${Math.min(spendProgress, 100)}%`}}></div>
              </div>
              <p className="text-[10px] mt-2 text-slate-300">Spend ৳{spendNeeded > 0 ? spendNeeded.toFixed(2) : 0} more to reach {currentTier.next}</p>
            </div>
          )}
           {currentTier.name === 'Platinum' && (
             <div className="mt-8">
                <p className="text-lg font-bold text-yellow-300">You are at the highest tier!</p>
             </div>
           )}
        </div>
        <Star className="absolute -bottom-4 -right-4 text-slate-600/20" size={150} />
      </div>

      {/* Point Card */}
      <div className="bg-background border p-6 rounded-2xl flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-sm">Available Points</p>
            <h3 className="text-4xl font-black text-primary">{userData.loyaltyPoints || 0}</h3>
          </div>
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-between">
          <p className="text-green-700 text-sm font-bold">
            Equivalent to Cash: ৳{pointsToCash}
          </p>
          <Link href="/customer/loyalty-points">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <History size={12} />
                View History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
