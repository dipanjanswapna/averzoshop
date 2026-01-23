
'use client';

import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import type { StockRequest } from '@/types/logistics';
import type { Outlet } from '@/types/outlet';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateStockRequestDialog } from '@/components/vendor/create-stock-request-dialog';
import { cn } from '@/lib/utils';

export default function VendorStockRequestsPage() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: allRequests, isLoading: requestsLoading } = useFirestoreQuery<StockRequest>('stock_requests');
  const { data: outlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');
  
  const isLoading = requestsLoading || outletsLoading;

  const vendorRequests = useMemo(() => {
    if (!allRequests || !user || !outlets) return [];
    
    const outletMap = new Map(outlets.map(o => [o.id, o.name]));
    
    return allRequests
      .filter(req => req.vendorId === user.uid)
      .map(req => ({
        ...req,
        outletName: outletMap.get(req.outletId) || req.outletId,
      }))
      .sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [allRequests, user, outlets]);

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
      </TableRow>
    ))
  );

  const getStatusBadge = (status: StockRequest['status']) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    let Icon = Clock;
    
    switch (status) {
      case 'pending':
        variant = 'secondary';
        className = 'bg-orange-500/10 text-orange-600';
        Icon = Clock;
        break;
      case 'approved':
        variant = 'secondary';
        className = 'bg-green-500/10 text-green-600';
        Icon = CheckCircle;
        break;
      case 'shipped':
         variant = 'secondary';
         className = 'bg-blue-500/10 text-blue-600';
         Icon = Truck;
         break;
      case 'received':
        variant = 'secondary';
        className = 'bg-green-500/10 text-green-600';
        Icon = CheckCircle;
        break;
      case 'rejected':
        variant = 'destructive';
        Icon = XCircle;
        break;
    }
    
    return (
        <Badge variant={variant} className={cn('capitalize gap-1')}>
            <Icon className="h-3 w-3" />
            {status}
        </Badge>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">My Stock Requests</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Request
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>A log of all stock supply requests you've made.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Destination Outlet</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : vendorRequests.length > 0 ? (
                  vendorRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{req.createdAt?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{req.outletName}</TableCell>
                      <TableCell>{req.totalQuantity}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No stock requests found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <CreateStockRequestDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  );
}
