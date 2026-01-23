'use client';

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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserData } from '@/types/user';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

export function AdminVendorView() {
  const { firestore } = useFirebase();
  const vendorsQuery = useMemo(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'vendor')) : null, [firestore]);
  const { data: vendors, isLoading } = useFirestoreQuery<UserData>(vendorsQuery);

  const renderDesktopSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  const renderMobileSkeleton = () => (
     [...Array(3)].map((_, i) => (
        <Card key={i} className="flex-1 min-w-[280px] max-w-sm">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Vendors</CardTitle>
        <CardDescription>Manage all product suppliers for Averzo.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderDesktopSkeleton()
              ) : vendors && vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <TableRow key={vendor.uid}>
                    <TableCell className="font-medium">{vendor.displayName}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'approved' ? 'secondary' : 'destructive'} className={cn(vendor.status === 'approved' && 'bg-green-500/10 text-green-600')}>
                        {vendor.status === 'approved' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Manage Products</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No vendors found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Mobile Cards */}
        <div className="flex flex-wrap justify-center md:hidden gap-4">
           {isLoading ? renderMobileSkeleton() : vendors && vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <Card key={vendor.uid} className="flex-1 min-w-[280px] max-w-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{vendor.displayName}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Manage Products</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                       <Badge variant={vendor.status === 'approved' ? 'secondary' : 'destructive'} className={cn('w-fit', vendor.status === 'approved' && 'bg-green-500/10 text-green-600')}>
                        {vendor.status === 'approved' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {vendor.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                    </CardContent>
                  </Card>
                ))
            ) : (
                <div className="text-center py-10">No vendors found.</div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
