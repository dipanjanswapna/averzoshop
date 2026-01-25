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
import Link from 'next/link';

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
    let variant: "default" | "secondary" | "destructive" = "secondary";
    let Icon = Clock;
    
    switch (status) {
      case 'requested':
        variant = 'secondary';
        Icon = Clock;
        break;
      case 'dispatched':
         variant = 'secondary';
         Icon = Truck;
         break;
      case 'received':
        variant = 'default';
        Icon = CheckCircle;
        break;
      case 'cancelled':
        variant = 'destructive';
        Icon = XCircle;
        break;
    }
    
    return <Badge variant={variant} className="capitalize gap-1"><Icon className="h-3 w-3" /> {status}</Badge>;
  };

  const renderDesktopSkeleton = () => (
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

  const renderMobileSkeleton = () => (
     [...Array(3)].map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
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
           {/* Desktop Table */}
          <div className="hidden md:block">
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
                {isLoading ? renderDesktopSkeleton() : enhancedTransfers.length > 0 ? enhancedTransfers.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.createdAt?.toDate().toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                        <Link href={`/outlet/${t.sourceOutletId}`} className="hover:underline" target="_blank">{t.sourceOutletName}</Link>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Link href={`/outlet/${t.destinationOutletId}`} className="hover:underline" target="_blank">{t.destinationOutletName}</Link>
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
          </div>
          {/* Mobile Cards */}
          <div className="flex flex-col md:hidden gap-4">
             {isLoading ? renderMobileSkeleton() : enhancedTransfers.length > 0 ? enhancedTransfers.map(t => (
                <Card key={t.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{t.productName}</CardTitle>
                        {getStatusBadge(t.status)}
                    </div>
                     <CardDescription className="text-xs">{t.createdAt?.toDate().toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     <div className="flex items-center gap-2 text-sm">
                        <Link href={`/outlet/${t.sourceOutletId}`} className="hover:underline" target="_blank">{t.sourceOutletName}</Link>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Link href={`/outlet/${t.destinationOutletId}`} className="hover:underline" target="_blank">{t.destinationOutletName}</Link>
                    </div>
                     <p className="font-bold text-lg">{t.quantity} <span className="text-sm font-normal text-muted-foreground">units</span></p>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-10">No stock transfers found.</div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
