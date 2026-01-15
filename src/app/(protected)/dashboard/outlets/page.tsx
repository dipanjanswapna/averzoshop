
'use client';

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
import { PlusCircle, MoreHorizontal, MapPin, Power } from 'lucide-react';
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
import { useState } from 'react';
import { AddOutletDialog } from '@/components/dashboard/add-outlet-dialog';

interface Outlet {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Inactive';
}

export default function OutletsPage() {
  const { data: outlets, isLoading } = useFirestoreQuery<Outlet>('outlets');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Offline Outlets</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Outlet
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Outlet Management</CardTitle>
            <CardDescription>Manage inventory and sales for physical store locations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Outlet Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : outlets && outlets.length > 0 ? (
                  outlets.map((outlet) => (
                    <TableRow key={outlet.id}>
                      <TableCell className="font-medium">{outlet.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <MapPin className="h-4 w-4 text-muted-foreground" />
                           {outlet.location}
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant={outlet.status === 'Active' ? 'default' : 'secondary'} className={outlet.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            <Power className="mr-1 h-3 w-3" />
                           {outlet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>Manage Inventory</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No outlets found. Get started by adding a new one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AddOutletDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
