'use client';

import { useState } from 'react';
import {
  deliveryMonitoringDashboard,
  type DeliveryMonitoringDashboardOutput,
} from '@/ai/flows/delivery-monitoring-dashboard';
import { activeDeliveries } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Bot, Truck, CheckCircle, Hourglass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function DeliveryMonitor() {
  const [analysis, setAnalysis] = useState<DeliveryMonitoringDashboardOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await deliveryMonitoringDashboard({
        activeDeliveries: JSON.stringify(activeDeliveries),
      });
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                <Bot size={24} /> AI Delivery Monitor
                </CardTitle>
                <CardDescription className="mt-1">
                Use AI to identify potential delays and issues in active deliveries.
                </CardDescription>
            </div>
            <Button onClick={handleAnalysis} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Active Deliveries'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
            <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">
                <strong>Error:</strong> {error}
            </div>
        )}
        {isLoading && (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                 <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </div>
        )}
        {analysis && (
            <div>
                {analysis.alerts.length > 0 ? (
                    <div className="space-y-4">
                    {analysis.alerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                            <div className="p-2 bg-destructive/10 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">
                                    Delivery ID: <Badge variant="destructive">{alert.deliveryId}</Badge>
                                </p>
                                <p className="text-sm mt-1">
                                    <strong className="text-muted-foreground">Issue:</strong> {alert.issue}
                                </p>
                                <p className="text-sm mt-1">
                                    <strong className="text-muted-foreground">Suggestion:</strong> {alert.suggestedAction}
                                </p>
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="font-bold text-lg">All Systems Normal</h3>
                        <p className="text-muted-foreground">AI analysis found no potential issues with active deliveries.</p>
                    </div>
                )}
            </div>
        )}
        {!analysis && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <Hourglass className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-bold text-lg">Awaiting Analysis</h3>
                <p className="text-muted-foreground">Click the button above to start the AI delivery analysis.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
