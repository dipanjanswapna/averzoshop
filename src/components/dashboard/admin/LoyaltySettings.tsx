
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
    pointsPer100Taka: number;
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
  
  const [pointsPer100, setPointsPer100] = useState(5);
  const [pointValue, setPointValue] = useState(0.20);
  const [goldThreshold, setGoldThreshold] = useState(5000);
  const [platinumThreshold, setPlatinumThreshold] = useState(15000);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setPointsPer100(settings.pointsPer100Taka || 5);
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
            pointsPer100Taka: Number(pointsPer100),
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="points-per-100">Points per ৳100 Spent</Label>
                    <Input 
                        id="points-per-100"
                        type="number" 
                        value={pointsPer100}
                        onChange={(e) => setPointsPer100(Number(e.target.value))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="point-value">1 Point Value (in BDT)</Label>
                    <Input 
                    id="point-value"
                    type="number" 
                    step="0.01"
                    value={pointValue} 
                    onChange={(e) => setPointValue(Number(e.target.value))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gold-threshold">Gold Tier Spend Threshold (BDT)</Label>
                    <Input 
                        id="gold-threshold"
                        type="number"
                        value={goldThreshold}
                        onChange={(e) => setGoldThreshold(Number(e.target.value))}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="platinum-threshold">Platinum Tier Spend Threshold (BDT)</Label>
                    <Input 
                        id="platinum-threshold"
                        type="number"
                        value={platinumThreshold}
                        onChange={(e) => setPlatinumThreshold(Number(e.target.value))}
                    />
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
