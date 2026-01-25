'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import { PlusCircle, MoreHorizontal, Mail, Search, CheckCircle, XCircle, Clock, Users, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { UserData } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ManageVendorOutletsDialog } from '@/components/dashboard/manage-vendor-outlets-dialog';
import { AddUserDialog } from '@/components/dashboard/add-user-dialog';
import { AssignSalesRepDialog } from '@/components/dashboard/assign-sales-rep-dialog';
import { AdjustPointsDialog } from '@/components/dashboard/adjust-points-dialog';
import { cn } from '@/lib/utils';
import { SetCardPromoDialog } from '@/components/dashboard/set-card-promo-dialog';
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


export default function UsersPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { data: users, isLoading } = useFirestoreQuery<UserData>('users');
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isManageOutletsOpen, setIsManageOutletsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<UserData | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAssignRepOpen, setIsAssignRepOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);
  const [isAdjustPointsDialogOpen, setIsAdjustPointsDialogOpen] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState<UserData | null>(null);
  const [isSetPromoDialogOpen, setIsSetPromoDialogOpen] = useState(false);
  const [selectedUserForPromo, setSelectedUserForPromo] = useState<UserData | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserData | null>(null);


  const handleStatusChange = async (uid: string, newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', uid);
    try {
      await updateDoc(userRef, { status: newStatus });
      toast({
        title: 'User status updated',
        description: `User has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update user status.',
      });
    }
  };

  const handleManageOutletsClick = (vendor: UserData) => {
    setSelectedVendor(vendor);
    setIsManageOutletsOpen(true);
  };
  
  const handleAssignRepClick = (customer: UserData) => {
    setSelectedCustomer(customer);
    setIsAssignRepOpen(true);
  };
  
  const handleAdjustPointsClick = (user: UserData) => {
    setSelectedUserForPoints(user);
    setIsAdjustPointsDialogOpen(true);
  };

  const handleSetPromoClick = (user: UserData) => {
    setSelectedUserForPromo(user);
    setIsSetPromoDialogOpen(true);
  };

  const handleSuspendClick = (user: UserData) => {
    setUserToSuspend(user);
    setIsSuspendDialogOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    await handleStatusChange(userToSuspend.uid, 'rejected');
    setIsSuspendDialogOpen(false);
    setUserToSuspend(null);
  };

  const salesRepMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.filter(u => u.role === 'sales').map(rep => [rep.uid, rep.displayName]));
  }, [users]);


  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users;

    if (filter !== 'all') {
      if (filter === 'pending') {
        filtered = filtered.filter(user => user.status === 'pending');
      } else {
        filtered = filtered.filter(user => user.role === filter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
  }, [users, filter, searchTerm]);

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );
  
  const getStatusBadge = (status: UserData['status']) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-500/10 text-green-600 capitalize"><CheckCircle className="mr-1 h-3 w-3" />{status}</Badge>;
        case 'pending':
            return <Badge className="bg-orange-500/10 text-orange-600 capitalize"><Clock className="mr-1 h-3 w-3" />{status}</Badge>;
        case 'rejected':
            return <Badge variant="destructive" className="capitalize"><XCircle className="mr-1 h-3 w-3" />{status}</Badge>;
        default:
            return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };


  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold font-headline">Users</h1>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all users including customers, vendors, and riders.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-8 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <div className="w-full overflow-x-auto no-scrollbar">
                <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="customer">Customers</TabsTrigger>
                <TabsTrigger value="sales">Sales Reps</TabsTrigger>
                <TabsTrigger value="vendor">Vendors</TabsTrigger>
                <TabsTrigger value="artisan">Artisans</TabsTrigger>
                <TabsTrigger value="rider">Riders</TabsTrigger>
                <TabsTrigger value="pending" className="text-orange-500">Pending</TabsTrigger>
                </TabsList>
            </div>
            <div className="mt-4">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Managed By</TableHead>
                      <TableHead className="text-right">Loyalty Points</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? renderSkeleton() : filteredUsers.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                              No users found for this filter.
                          </TableCell>
                      </TableRow>
                    ) : filteredUsers.map(user => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                               <div className="font-medium">
                                {user.role === 'artisan' ? (
                                    <Link href={`/artisan/${user.uid}`} className="hover:underline text-primary" target="_blank">
                                    {user.displayName}
                                    </Link>
                                ) : (
                                    user.displayName
                                )}
                                </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {user.role === 'customer' && user.managedBy 
                                ? salesRepMap.get(user.managedBy) || 'Unknown Rep' 
                                : 'N/A'
                            }
                        </TableCell>
                        <TableCell className="text-right font-medium">
                            <div className="flex items-center justify-end gap-1">
                                <Award className="h-4 w-4 text-yellow-500" />
                                {user.loyaltyPoints ?? 0}
                            </div>
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
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleAdjustPointsClick(user)}>
                                Adjust Points
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetPromoClick(user)}>
                                Set Card Promo
                              </DropdownMenuItem>
                               {user.role === 'customer' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleAssignRepClick(user)}>
                                    Assign Sales Rep
                                  </DropdownMenuItem>
                                </>
                              )}
                               {user.role === 'vendor' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleManageOutletsClick(user)}>
                                    Manage Assigned Outlets
                                  </DropdownMenuItem>
                                </>
                              )}
                              {user.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'approved')} className="text-green-600 focus:bg-green-50 focus:text-green-700">
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'rejected')} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSuspendClick(user)} className="text-destructive focus:text-destructive">Suspend</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="flex flex-wrap justify-center md:hidden gap-4">
                 {isLoading ? [...Array(3)].map((_, i) => (
                    <Card key={i} className="flex-1 min-w-[300px] max-w-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <Skeleton className="h-5 w-16" />
                             <Skeleton className="h-6 w-20 rounded-full" />
                        </CardContent>
                    </Card>
                 )) : filteredUsers.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Users Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try a different filter or search term.</p>
                    </div>
                 ): filteredUsers.map(user => (
                    <Card key={user.uid} className="flex-1 min-w-[300px] max-w-sm">
                        <CardHeader>
                             <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                          {user.role === 'artisan' ? (
                                            <Link href={`/artisan/${user.uid}`} className="hover:underline text-primary" target="_blank">
                                              {user.displayName}
                                            </Link>
                                          ) : (
                                            user.displayName
                                          )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleAdjustPointsClick(user)}>
                                        Adjust Points
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleSetPromoClick(user)}>
                                      Set Card Promo
                                    </DropdownMenuItem>
                                     {user.role === 'customer' && (
                                        <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleAssignRepClick(user)}>
                                            Assign Sales Rep
                                        </DropdownMenuItem>
                                        </>
                                    )}
                                     {user.role === 'vendor' && (
                                        <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleManageOutletsClick(user)}>
                                            Manage Assigned Outlets
                                        </DropdownMenuItem>
                                        </>
                                    )}
                                    {user.status === 'pending' && (
                                        <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'approved')} className="text-green-600 focus:bg-green-50">Approve</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'rejected')} className="text-destructive focus:bg-destructive/10">Reject</DropdownMenuItem>
                                        </>
                                    )}
                                     <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleSuspendClick(user)} className="text-destructive focus:text-destructive">Suspend</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            {getStatusBadge(user.status)}
                        </CardContent>
                         <CardFooter className="flex-col items-start gap-2 text-xs text-muted-foreground pt-0 pb-3 px-4">
                            {user.role === 'customer' && user.managedBy && (
                                <p>Managed by: {salesRepMap.get(user.managedBy) || 'Unknown'}</p>
                            )}
                            <div className="flex items-center gap-1 font-semibold">
                                <Award className="h-3 w-3 text-yellow-500"/>
                                Loyalty Points: {user.loyaltyPoints ?? 0}
                            </div>
                         </CardFooter>
                    </Card>
                 ))}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    <AddUserDialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen} />
    {selectedVendor && (
      <ManageVendorOutletsDialog
          open={isManageOutletsOpen}
          onOpenChange={setIsManageOutletsOpen}
          vendor={selectedVendor}
      />
    )}
    {selectedCustomer && (
        <AssignSalesRepDialog
            open={isAssignRepOpen}
            onOpenChange={setIsAssignRepOpen}
            customer={selectedCustomer}
        />
    )}
    {selectedUserForPoints && (
        <AdjustPointsDialog
            open={isAdjustPointsDialogOpen}
            onOpenChange={setIsAdjustPointsDialogOpen}
            user={selectedUserForPoints}
        />
    )}
    {selectedUserForPromo && (
        <SetCardPromoDialog
            open={isSetPromoDialogOpen}
            onOpenChange={setIsSetPromoDialogOpen}
            user={selectedUserForPromo}
        />
    )}
    <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will suspend the user <span className="font-bold">{userToSuspend?.displayName}</span> and block their access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmSuspend} className={buttonVariants({ variant: "destructive" })}>
              Confirm Suspension
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
