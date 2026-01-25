
'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface RegistrationSettingsData {
    vendor: boolean;
    rider: boolean;
    sales: boolean;
    artisan: boolean;
}

export function RegistrationSettings() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { data: settings, isLoading: isLoadingSettings } = useFirestoreDoc<RegistrationSettingsData>('settings/registration');
  
  const [vendorReg, setVendorReg] = useState(true);
  const [riderReg, setRiderReg] = useState(true);
  const [salesReg, setSalesReg] = useState(true);
  const [artisanReg, setArtisanReg] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setVendorReg(settings.vendor ?? true);
      setRiderReg(settings.rider ?? true);
      setSalesReg(settings.sales ?? true);
      setArtisanReg(settings.artisan ?? true);
    }
  }, [settings]);

  const handleUpdateSettings = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'registration');
        await setDoc(settingsRef, {
            vendor: vendorReg,
            rider: riderReg,
            sales: salesReg,
            artisan: artisanReg,
        }, { merge: true });
        toast({ title: "Settings Saved", description: "Registration rules have been updated." });
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
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Registration Settings</CardTitle>
            <CardDescription>
                Control which user roles can sign up for an account.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Allow Vendor Registration</Label>
                        <p className="text-xs text-muted-foreground">If turned off, new vendors cannot sign up.</p>
                    </div>
                    <Switch checked={vendorReg} onCheckedChange={setVendorReg} />
                </div>
                 <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Allow Artisan / Home Business Registration</Label>
                        <p className="text-xs text-muted-foreground">If turned off, new artisans cannot sign up.</p>
                    </div>
                    <Switch checked={artisanReg} onCheckedChange={setArtisanReg} />
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Allow Rider Registration</Label>
                         <p className="text-xs text-muted-foreground">If turned off, new riders cannot sign up.</p>
                    </div>
                    <Switch checked={riderReg} onCheckedChange={setRiderReg} />
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Allow Sales Rep Registration</Label>
                         <p className="text-xs text-muted-foreground">If turned off, new sales reps cannot sign up.</p>
                    </div>
                    <Switch checked={salesReg} onCheckedChange={setSalesReg} />
                </div>
            </div>

            <Button onClick={handleUpdateSettings} className="w-full h-12 gap-2" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={18} />} 
            {isSaving ? 'Saving...' : 'SAVE REGISTRATION SETTINGS'}
            </Button>
        </CardContent>
    </Card>
  );
}

    