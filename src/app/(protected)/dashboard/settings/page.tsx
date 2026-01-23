'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoyaltySettings } from '@/components/dashboard/admin/LoyaltySettings';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers';
import { Moon, Sun } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RegistrationSettings } from '@/components/dashboard/admin/RegistrationSettings';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      
       <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun size={16} /> Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon size={16} /> Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LoyaltySettings />
      <RegistrationSettings />
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Manage general settings for the Averzo platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Other settings controls will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
