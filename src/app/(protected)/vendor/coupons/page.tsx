
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

export default function VendorCouponsPage() {
  const { user } = useAuth();
  const { data: allCoupons, isLoading } = useFirestoreQuery<Coupon>('coupons');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const vendorCoupons = useMemo(() => {
    if (!allCoupons || !user) return [];
    return allCoupons.filter(coupon => coupon.creatorId === user.uid);
  }, [allCoupons, user]);

  const renderSkeleton = () => (
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
                {isLoading ? renderSkeleton() : vendorCoupons.length > 0 ? (
                  vendorCoupons.map((coupon) => (
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
          </CardContent>
        </Card>
      </div>
      <AddVendorCouponDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
