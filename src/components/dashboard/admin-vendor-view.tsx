
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

interface Vendor {
  id: string;
  name: string;
  contact: string;
  status: 'Active' | 'Inactive';
}

export function AdminVendorView() {
  const { data: vendors, isLoading } = useFirestoreQuery<Vendor>('vendors');

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
       <Card key={i}>
         <CardHeader>
           <Skeleton className="h-6 w-3/4" />
           <Skeleton className="h-4 w-1/2" />
         </CardHeader>
         <CardContent>
           <Skeleton className="h-6 w-24" />
         </CardContent>
         <CardFooter>
           <Skeleton className="h-9 w-full" />
         </CardFooter>
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
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderDesktopSkeleton()
              ) : vendors && vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.contact}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'Active' ? 'secondary' : 'destructive'} className={cn(vendor.status === 'Active' && 'bg-green-500/10 text-green-600')}>
                         {vendor.status === 'Active' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
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
        <div className="grid md:hidden gap-4">
            {isLoading ? renderMobileSkeleton() : vendors && vendors.length > 0 ? (
                vendors.map((vendor) => (
                    <Card key={vendor.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-base">{vendor.name}</CardTitle>
                                <Badge variant={vendor.status === 'Active' ? 'secondary' : 'destructive'} className={cn(vendor.status === 'Active' && 'bg-green-500/10 text-green-600')}>
                                    {vendor.status}
                                </Badge>
                            </div>
                            <CardDescription>{vendor.contact}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View Details</Button>
                        </CardFooter>
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
