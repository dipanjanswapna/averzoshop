'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function RiderDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Active Deliveries</CardTitle>
                    <CardDescription>Here are the deliveries assigned to you.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                    <Truck className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Active Deliveries</h3>
                    <p className="mt-1 text-sm text-muted-foreground">You will be notified when new deliveries are assigned.</p>
                </CardContent>
            </Card>
        </div>
    );
}
