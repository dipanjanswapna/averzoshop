'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { UserData } from '@/types/user';
import { planSalesRepRoute, type SalesRoutePlannerOutput } from '@/ai/flows/sales-route-planner';
import { Loader2, MapPin, Bot, ListOrdered } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoutePlannerPage() {
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [startLocation, setStartLocation] = useState('Averzo Head Office, Gulshan, Dhaka');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SalesRoutePlannerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');
  
  const salesReps = useMemo(() => users?.filter(u => u.role === 'sales') || [], [users]);
  const customers = useMemo(() => users?.filter(u => u.role === 'customer') || [], [users]);

  const handleGenerateRoute = async () => {
    if (!selectedRepId) {
      setError("Please select a sales representative.");
      return;
    }
    
    const selectedRep = salesReps.find(rep => rep.uid === selectedRepId);
    if (!selectedRep) {
        setError("Selected sales rep not found.");
        return;
    }

    // Find customers managed by this rep.
    const repCustomers = customers.filter(c => c.managedBy === selectedRepId);
    
    if (repCustomers.length === 0) {
        setError("This sales rep has no customers assigned to them.");
        return;
    }

    // Get customer locations. The address is an array. I'll take the first one if available.
    const customerLocations = repCustomers.map(c => ({
        name: c.displayName,
        address: c.addresses && c.addresses.length > 0
            ? `${c.addresses[0].streetAddress}, ${c.addresses[0].area}, ${c.addresses[0].district}`
            : 'Address not available'
    })).filter(c => c.address !== 'Address not available');

    if (customerLocations.length === 0) {
        setError("No customers with valid addresses found for this sales rep.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await planSalesRepRoute({
        startLocation,
        customerLocations: JSON.stringify(customerLocations),
      });
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during route planning.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">AI Sales Route Planner</h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate Optimized Route</CardTitle>
          <CardDescription>
            Select a sales representative and a starting location to generate the most efficient daily route using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="sales-rep">Sales Representative</Label>
              <Select onValueChange={setSelectedRepId} disabled={usersLoading}>
                <SelectTrigger id="sales-rep">
                  <SelectValue placeholder="Select a sales rep..." />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                     <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    salesReps.map(rep => (
                      <SelectItem key={rep.uid} value={rep.uid}>{rep.displayName}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="start-location">Starting Location</Label>
                <Input
                    id="start-location"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                />
            </div>
          </div>
           <Button onClick={handleGenerateRoute} disabled={isLoading || !selectedRepId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Generate Route
          </Button>
        </CardContent>
      </Card>
      
      {error && (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Analysis Error</CardTitle>
                <CardDescription>{error}</CardDescription>
            </CardHeader>
        </Card>
      )}
      
      {isLoading && (
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListOrdered /> Optimized Route Plan</CardTitle>
                <CardDescription>The most efficient route for the selected sales representative, starting from "{startLocation}".</CardDescription>
            </CardHeader>
            <CardContent>
                <ol className="space-y-4">
                    {analysis.optimizedRoute.map(stop => (
                        <li key={stop.step} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary text-primary-foreground h-10 w-10 rounded-full font-bold text-lg">
                                {stop.step}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">{stop.customerName}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin size={12}/> {stop.address}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
