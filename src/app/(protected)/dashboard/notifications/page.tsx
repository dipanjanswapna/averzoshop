'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NotificationsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Push Notifications</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Composer</CardTitle>
                    <CardDescription>
                        Send a message directly to your subscribed users' devices.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="E.g., Flash Sale is LIVE!"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="E.g., Grab your favorite products at 50% off!"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="link">Link (Optional)</Label>
                        <Input id="link" placeholder="E.g., /flash-sale"/>
                    </div>
                    <Button className="w-full" size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
