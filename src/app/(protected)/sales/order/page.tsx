'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function SalesOrderPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Place a New Order</h1>
             <Card>
                <CardHeader>
                    <CardTitle>On-the-Go Ordering</CardTitle>
                    <CardDescription>This feature is coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
                        <Construction className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 font-semibold">Under Construction</h3>
                        <p className="text-sm text-muted-foreground">The mobile-optimized ordering interface for sales reps is being built.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
