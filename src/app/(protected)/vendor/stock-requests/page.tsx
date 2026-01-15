
'use client';

import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import type { StockRequest } from '@/types/logistics';
import type { Outlet } from '@/types/outlet';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateStockRequestDialog } from '@/components/vendor/create-stock-request-dialog';

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
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 capitalize"><Clock className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 capitalize"><CheckCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'shipped':
         return <Badge variant="default" className="bg-purple-100 text-purple-800 capitalize"><Truck className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'received':
        return <Badge variant="default" className="bg-green-100 text-green-800 capitalize"><CheckCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="capitalize"><XCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
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
