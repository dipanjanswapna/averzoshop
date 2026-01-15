
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
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
import { PlusCircle, MoreHorizontal, Mail, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
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

export default function UsersPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { data: users, isLoading } = useFirestoreQuery<UserData>('users');
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    
    return filtered;
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
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold font-headline">Users</h1>
        <Button>
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
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="customer">Customers</TabsTrigger>
              <TabsTrigger value="vendor">Vendors</TabsTrigger>
              <TabsTrigger value="rider">Riders</TabsTrigger>
              <TabsTrigger value="pending" className="text-orange-500">Pending</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? renderSkeleton() : filteredUsers.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
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
                              <div className="font-medium">{user.displayName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'approved' ? 'default' : (user.status === 'pending' ? 'secondary' : 'destructive')} 
                            className={
                            user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            user.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {user.status === 'approved' ? <CheckCircle className="mr-1 h-3 w-3" /> : 
                             user.status === 'pending' ? <Clock className="mr-1 h-3 w-3" /> :
                             <XCircle className="mr-1 h-3 w-3" />
                            }
                            <span className="capitalize">{user.status}</span>
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
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
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
                              <DropdownMenuItem className="text-destructive focus:text-destructive">Suspend</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="grid md:hidden gap-4">
                 {isLoading ? [...Array(3)].map((_, i) => (
                    <Card key={i}>
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
                    <Card key={user.uid}>
                        <CardHeader>
                             <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.displayName}</div>
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
                                    {user.status === 'pending' && (
                                        <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'approved')} className="text-green-600 focus:bg-green-50">Approve</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'rejected')} className="text-destructive focus:bg-destructive/10">Reject</DropdownMenuItem>
                                        </>
                                    )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            <Badge variant={user.status === 'approved' ? 'default' : (user.status === 'pending' ? 'secondary' : 'destructive')} 
                                className={
                                user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                user.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                            }>
                                {user.status === 'approved' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                                <span className="capitalize">{user.status}</span>
                            </Badge>
                        </CardContent>
                    </Card>
                 ))}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
