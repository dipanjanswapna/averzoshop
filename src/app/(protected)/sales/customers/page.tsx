
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
import { PlusCircle, Search } from 'lucide-react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import type { UserData } from '@/types/user';
import { collection, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { AddCustomerDialog } from '@/components/sales/add-customer-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function SalesCustomersPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const customersQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users'), where('managedBy', '==', user.uid));
  }, [firestore, user]);

  const { data: customers, isLoading } = useFirestoreQuery<UserData>(customersQuery);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm) return customers;
    
    return customers.filter(customer =>
      customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const renderDesktopSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      </TableRow>
    ))
  );

  const renderMobileSkeleton = () => (
     [...Array(3)].map((_, i) => (
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
          <CardContent>
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">My Customers</h1>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>Manage the customers assigned to you.</CardDescription>
            <div className="relative pt-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by name, email, or phone..."
                className="pl-8 w-full md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent>
             {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? renderDesktopSkeleton() : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.uid}>
                        <TableCell className="font-medium">{customer.displayName}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="flex flex-wrap justify-center md:hidden gap-4">
              {isLoading ? renderMobileSkeleton() : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Card key={customer.uid} className="flex-1 min-w-[300px] max-w-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{customer.displayName?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{customer.displayName}</p>
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Phone: {customer.phone || 'N/A'}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">No customers found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <AddCustomerDialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen} />
    </>
  );
}
