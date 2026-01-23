
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
  CardFooter,
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

  const renderDesktopSkeleton = () => (
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

  const renderMobileSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
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
          {/* Desktop Table */}
          <div className="hidden md:block">
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
                {isLoading ? renderDesktopSkeleton() : vendorChallans.length > 0 ? (
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
          </div>

           {/* Mobile Cards */}
          <div className="flex flex-col md:hidden gap-4">
             {isLoading ? renderMobileSkeleton() : vendorChallans.length > 0 ? (
                vendorChallans.map(challan => (
                  <Card key={challan.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                           <CardTitle className="text-sm font-mono">{challan.id.substring(0, 8)}...</CardTitle>
                           <CardDescription>To: {challan.outletName}</CardDescription>
                        </div>
                        <Badge className="capitalize">{challan.status}</Badge>
                      </div>
                    </CardHeader>
                     <CardContent>
                       <p className="text-xs text-muted-foreground">Issued: {challan.issuedAt?.toDate().toLocaleDateString()}</p>
                    </CardContent>
                    <CardFooter>
                       <Link href={`/vendor/challan/${challan.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          View & Print
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">No delivery challans found.</div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
