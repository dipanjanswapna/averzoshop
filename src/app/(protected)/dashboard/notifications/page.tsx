
'use client';

import { useState } from 'react';
import { sendNotification } from '@/actions/notification-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SendNotificationForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      title: form.title.value,
      body: form.body.value,
      link: form.link.value,
    };

    const res = await sendNotification(data);
    setLoading(false);
    
    if (res.success) {
        toast({
            title: "Notifications Sent!",
            description: `Successfully sent to ${res.successCount} user(s). Failed: ${res.failureCount}.`,
        });
        form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Failed to Send Notifications",
            description: res.error,
        });
    }
  }

  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Push Notifications</h1>
        <Card>
            <CardHeader>
                <CardTitle>Notification Composer</CardTitle>
                <CardDescription>Send a push notification to all subscribed users.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="e.g.,⚡️ Flash Sale!" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="body">Message</Label>
                        <Textarea id="body" name="body" placeholder="e.g., Get 50% off on all t-shirts. Today only!" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="link">Click URL (Optional)</Label>
                        <Input id="link" name="link" placeholder="https://averzo.com/flash-sale" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Notification'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
