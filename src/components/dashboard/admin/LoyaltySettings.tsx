'use client';
import { useState } from 'react';
import { Settings, Save } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


export function LoyaltySettings() {
  const [rate, setRate] = useState(0.20); // 1 point = 0.20 BDT
  const [pointsPer100, setPointsPer100] = useState(5);

  const handleUpdateSettings = () => {
    // API Call to Update Firestore Settings would go here.
    // For now, it just shows an alert.
    alert("Point Conversion Rate Updated!");
  };

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                 <Settings className="h-6 w-6 text-primary" />
                 <CardTitle>Loyalty & Rewards</CardTitle>
            </div>
            <CardDescription>
                Set the rules for how customers earn and redeem loyalty points.
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
                    value={rate} 
                    onChange={(e) => setRate(Number(e.target.value))}
                    />
                </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm italic border border-blue-200">
                💡 Currently, redeeming 1000 points will give a customer a discount of ৳{(1000 * rate).toFixed(2)}.
                </div>

                <Button onClick={handleUpdateSettings} className="w-full h-12 gap-2">
                <Save size={18} /> SAVE CONFIGURATION
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
