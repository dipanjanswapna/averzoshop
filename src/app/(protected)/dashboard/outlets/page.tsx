
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
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, MapPin, Power, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { AddOutletDialog } from '@/components/dashboard/add-outlet-dialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Outlet } from '@/types/outlet';
import { EditOutletDialog } from '@/components/dashboard/edit-outlet-dialog';
import { updateOutletStatus, deleteOutlet } from '@/actions/outlet-actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function OutletsPage() {
  const { data: outlets, isLoading } = useFirestoreQuery<Outlet>('outlets');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [outletToEdit, setOutletToEdit] = useState<Outlet | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [outletToDelete, setOutletToDelete] = useState<Outlet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditClick = (outlet: Outlet) => {
    setOutletToEdit(outlet);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (outlet: Outlet) => {
    setOutletToDelete(outlet);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!outletToDelete) return;
    setIsDeleting(true);
    const result = await deleteOutlet(outletToDelete.id);
    if (result.success) {
      toast({ title: 'Outlet Deleted', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
    }
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setOutletToDelete(null);
  };

  const handleStatusToggle = async (outlet: Outlet) => {
    setIsUpdatingStatus(outlet.id);
    const newStatus = outlet.status === 'Active' ? 'Inactive' : 'Active';
    const result = await updateOutletStatus(outlet.id, newStatus);
    if (result.success) {
        toast({ title: 'Status Updated', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Update Failed', description: result.message });
    }
    setIsUpdatingStatus(null);
  };

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
        <Card key={i} className="flex-1 min-w-[300px] max-w-sm">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
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
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outlet Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? renderDesktopSkeleton() : outlets && outlets.length > 0 ? (
                    outlets.map((outlet) => (
                      <TableRow key={outlet.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/outlets/${outlet.id}`} className="hover:underline text-primary">
                            {outlet.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {outlet.location.address}
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={outlet.status === 'Active' ? 'secondary' : 'destructive'} className={cn(outlet.status === 'Active' && 'bg-green-100 text-green-800')}>
                              <Power className="mr-1 h-3 w-3" />
                            {outlet.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdatingStatus === outlet.id}>
                                {isUpdatingStatus === outlet.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/outlets/${outlet.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details & Inventory
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(outlet)}>Edit Details</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusToggle(outlet)}>
                                {outlet.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(outlet)}>Delete Outlet</DropdownMenuItem>
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
            </div>
            
             {/* Mobile Cards */}
            <div className="flex flex-wrap justify-center md:hidden gap-4">
                {isLoading ? renderMobileSkeleton() : outlets && outlets.length > 0 ? (
                  outlets.map((outlet) => (
                     <Card key={outlet.id} className="flex-1 min-w-[300px] max-w-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                         <CardTitle className="text-lg">{outlet.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2" disabled={isUpdatingStatus === outlet.id}>
                                {isUpdatingStatus === outlet.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(outlet)}>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusToggle(outlet)}>
                                {outlet.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(outlet)}>Delete Outlet</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </CardHeader>
                      <CardContent>
                          <Badge variant={outlet.status === 'Active' ? 'secondary' : 'destructive'} className={cn(outlet.status === 'Active' && 'bg-green-500/10 text-green-600')}>
                              <Power className="mr-1 h-3 w-3" />
                            {outlet.status}
                          </Badge>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                            <MapPin className="h-4 w-4" />
                            {outlet.location.address}
                          </div>
                      </CardContent>
                       <CardFooter className="pt-4">
                         <Link href={`/dashboard/outlets/${outlet.id}`} className="w-full">
                           <Button variant="outline" className="w-full"><Eye className="mr-2 h-4 w-4" /> View Details</Button>
                         </Link>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
                     <Building className="w-12 h-12 text-muted-foreground" />
                     <h3 className="font-semibold mt-4">No Outlets Found</h3>
                     <p className="text-sm text-muted-foreground">Get started by adding a new one.</p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
      <AddOutletDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <EditOutletDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} outlet={outletToEdit} />
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the outlet "{outletToDelete?.name}" and unassign its manager.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className={buttonVariants({ variant: "destructive" })}>
                {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
