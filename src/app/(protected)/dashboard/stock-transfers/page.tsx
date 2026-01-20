
'use client';

import { useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import type { StockTransfer } from '@/types/logistics';
import type { Outlet } from '@/types/outlet';

export default function StockTransfersPage() {
  const { data: transfers, isLoading: transfersLoading } = useFirestoreQuery<StockTransfer>('stock_transfers');
  const { data: outlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

  const isLoading = transfersLoading || outletsLoading;

  const enhancedTransfers = useMemo(() => {
    if (!transfers || !outlets) return [];

    const outletMap = new Map(outlets.map(o => [o.id, o.name]));

    return transfers.map(t => ({
      ...t,
      sourceOutletName: outletMap.get(t.sourceOutletId) || t.sourceOutletId,
      destinationOutletName: outletMap.get(t.destinationOutletId) || t.destinationOutletId,
    })).sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [transfers, outlets]);

  const getStatusBadge = (status: StockTransfer['status']) => {
    switch (status) {
      case 'requested':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 capitalize"><Clock className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'dispatched':
         return <Badge variant="default" className="bg-blue-100 text-blue-800 capitalize"><Truck className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'received':
        return <Badge variant="default" className="bg-green-100 text-green-800 capitalize"><CheckCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="capitalize"><XCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Inter-Outlet Stock Transfers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>A log of all stock transfers initiated between outlets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transfer Details</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : enhancedTransfers.length > 0 ? enhancedTransfers.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.createdAt?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <span>{t.sourceOutletName}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>{t.destinationOutletName}</span>
                  </TableCell>
                  <TableCell>{t.productName}</TableCell>
                  <TableCell className="text-right font-bold">{t.quantity}</TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No stock transfers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
