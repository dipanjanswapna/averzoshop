
'use client';

import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import type { DeliveryChallan } from '@/types/logistics';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Eye, Printer } from 'lucide-react';
import { useMemo } from 'react';
import type { Outlet } from '@/types/outlet';

export default function VendorChallansPage() {
  const { user } = useAuth();
  const { data: allChallans, isLoading: challansLoading } = useFirestoreQuery<DeliveryChallan>('delivery_challans');
  const { data: outlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

  const isLoading = challansLoading || outletsLoading;
  
  const vendorChallans = useMemo(() => {
    if (!allChallans || !user || !outlets) return [];
    
    const outletMap = new Map(outlets.map(o => [o.id, o.name]));
    
    return allChallans
      .filter(c => c.vendorId === user.uid)
      .map(c => ({
        ...c,
        outletName: outletMap.get(c.outletId) || c.outletId,
      }))
      .sort((a, b) => (b.issuedAt?.toDate?.()?.getTime() || 0) - (a.issuedAt?.toDate?.()?.getTime() || 0));

  }, [allChallans, user, outlets]);

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Delivery Challans</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Issued Challans</CardTitle>
          <CardDescription>
            Here are all the delivery challans generated for your approved stock requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challan ID</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Destination Outlet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : vendorChallans.length > 0 ? (
                vendorChallans.map(challan => (
                  <TableRow key={challan.id}>
                    <TableCell className="font-mono text-xs">{challan.id.substring(0, 10)}...</TableCell>
                    <TableCell>{challan.issuedAt?.toDate().toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{challan.outletName}</TableCell>
                    <TableCell><Badge className="capitalize">{challan.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Link href={`/vendor/challan/${challan.id}`}>
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          View & Print
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No delivery challans found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
