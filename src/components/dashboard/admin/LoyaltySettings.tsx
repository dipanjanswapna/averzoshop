
'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface LoyaltySettingsData {
    pointsPer100Taka: {
        silver: number;
        gold: number;
        platinum: number;
    };
    pointValueInTaka: number;
    tierThresholds: {
        gold: number;
        platinum: number;
    }
}

export function LoyaltySettings() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { data: settings, isLoading: isLoadingSettings } = useFirestoreDoc<LoyaltySettingsData>('settings/loyalty');
  
  const [pointsSilver, setPointsSilver] = useState(5);
  const [pointsGold, setPointsGold] = useState(7);
  const [pointsPlatinum, setPointsPlatinum] = useState(10);
  const [pointValue, setPointValue] = useState(0.20);
  const [goldThreshold, setGoldThreshold] = useState(5000);
  const [platinumThreshold, setPlatinumThreshold] = useState(15000);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setPointsSilver(settings.pointsPer100Taka?.silver || 5);
      setPointsGold(settings.pointsPer100Taka?.gold || 7);
      setPointsPlatinum(settings.pointsPer100Taka?.platinum || 10);
      setPointValue(settings.pointValueInTaka || 0.20);
      setGoldThreshold(settings.tierThresholds?.gold || 5000);
      setPlatinumThreshold(settings.tierThresholds?.platinum || 15000);
    }
  }, [settings]);

  const handleUpdateSettings = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'loyalty');
        await setDoc(settingsRef, {
            pointsPer100Taka: {
                silver: Number(pointsSilver),
                gold: Number(pointsGold),
                platinum: Number(pointsPlatinum),
            },
            pointValueInTaka: Number(pointValue),
            tierThresholds: {
                gold: Number(goldThreshold),
                platinum: Number(platinumThreshold)
            }
        }, { merge: true });
        toast({ title: "Settings Saved", description: "Loyalty program rules have been updated." });
    } catch (e: any) {
        toast({ variant: 'destructive', title: "Save Failed", description: e.message });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoadingSettings) {
      return (
          <Card>
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                 <Settings className="h-6 w-6 text-primary" />
                 <CardTitle>Loyalty Points & Membership Configuration</CardTitle>
            </div>
            <CardDescription>
                Set the rules for how customers earn points and advance through membership tiers.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-medium">Points Earning Rate (per ৳100 spent)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="points-silver">Silver Tier</Label>
                            <Input id="points-silver" type="number" value={pointsSilver} onChange={(e) => setPointsSilver(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="points-gold">Gold Tier</Label>
                            <Input id="points-gold" type="number" value={pointsGold} onChange={(e) => setPointsGold(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="points-platinum">Platinum Tier</Label>
                            <Input id="points-platinum" type="number" value={pointsPlatinum} onChange={(e) => setPointsPlatinum(Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                 <div className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-medium">Redemption & Tier Thresholds</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="point-value">1 Point Value (in BDT)</Label>
                            <Input id="point-value" type="number" step="0.01" value={pointValue} onChange={(e) => setPointValue(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gold-threshold">Gold Tier Spend (BDT)</Label>
                            <Input id="gold-threshold" type="number" value={goldThreshold} onChange={(e) => setGoldThreshold(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platinum-threshold">Platinum Tier Spend (BDT)</Label>
                            <Input id="platinum-threshold" type="number" value={platinumThreshold} onChange={(e) => setPlatinumThreshold(Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm italic border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-500/30">
                💡 Currently, redeeming 1000 points will give a customer a discount of ৳{(1000 * pointValue).toFixed(2)}.
                </div>

                <Button onClick={handleUpdateSettings} className="w-full h-12 gap-2" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={18} />} 
                {isSaving ? 'Saving...' : 'SAVE CONFIGURATION'}
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
