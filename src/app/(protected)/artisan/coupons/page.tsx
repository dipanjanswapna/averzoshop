
'use client';

import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { AddVendorCouponDialog } from '@/components/vendor/add-vendor-coupon-dialog';
import type { Coupon } from '@/types/coupon';

export default function ArtisanCouponsPage() {
  const { user } = useAuth();
  const { data: allCoupons, isLoading } = useFirestoreQuery<Coupon>('coupons');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const artisanCoupons = useMemo(() => {
    if (!allCoupons || !user) return [];
    return allCoupons.filter(coupon => coupon.creatorId === user.uid);
  }, [allCoupons, user]);

  const renderDesktopSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      </TableRow>
    ))
  );

  const renderMobileSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <Card key={i} className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">My Coupons</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Coupon List</CardTitle>
            <CardDescription>Manage promotional codes for your products.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Min. Spend</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? renderDesktopSkeleton() : artisanCoupons.length > 0 ? (
                    artisanCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-medium font-mono text-primary">{coupon.code}</TableCell>
                        <TableCell className="capitalize">{coupon.discountType}</TableCell>
                        <TableCell>{coupon.discountType === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}</TableCell>
                        <TableCell>৳{coupon.minimumSpend}</TableCell>
                        <TableCell>{coupon.expiryDate.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>{coupon.usedCount} / {coupon.usageLimit}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        You haven't created any coupons yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="flex flex-col md:hidden gap-4">
              {isLoading ? renderMobileSkeleton() : artisanCoupons.length > 0 ? (
                artisanCoupons.map((coupon) => (
                  <Card key={coupon.id}>
                    <CardHeader>
                      <CardTitle className="font-mono text-primary flex justify-between items-center">
                        <span>{coupon.code}</span>
                        <span className="font-sans text-sm font-bold text-foreground capitalize">
                          {coupon.discountType === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`} OFF
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min. Spend:</span>
                        <span>৳{coupon.minimumSpend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage:</span>
                        <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{coupon.expiryDate.toDate().toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">You haven't created any coupons yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <AddVendorCouponDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}

    