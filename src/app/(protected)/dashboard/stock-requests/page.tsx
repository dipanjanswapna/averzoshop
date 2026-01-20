'use client';

import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
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
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { StockRequest } from '@/types/logistics';
import type { UserData } from '@/types/user';
import type { Outlet } from '@/types/outlet';
import { RequestDetailsDialog } from './request-details-dialog';
import { sendTargetedNotification } from '@/ai/flows/send-targeted-notification';

export default function StockRequestsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const { data: requests, isLoading: requestsLoading } = useFirestoreQuery<StockRequest>('stock_requests');
  const { data: users, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');
  const { data: outlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isLoading = requestsLoading || usersLoading || outletsLoading;

  const handleStatusChange = async (request: StockRequest, newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    const requestRef = doc(firestore, 'stock_requests', request.id);
    try {
      await updateDoc(requestRef, { status: newStatus });

      if (newStatus === 'approved') {
        // Create a delivery challan
        const challanRef = collection(firestore, 'delivery_challans');
        await addDoc(challanRef, {
            stockRequestId: request.id,
            vendorId: request.vendorId,
            outletId: request.outletId,
            items: request.items,
            totalQuantity: request.totalQuantity,
            status: 'issued',
            issuedAt: serverTimestamp(),
        });
         toast({
            title: 'Request Approved',
            description: `A delivery challan has been issued.`,
         });
         await sendTargetedNotification({
             userId: request.vendorId,
             title: 'Stock Request Approved',
             body: `Your request to supply stock has been approved.`,
             link: '/vendor/challans'
         });
      } else {
         toast({
            title: 'Request Rejected',
            description: `Request has been successfully rejected.`,
         });
          await sendTargetedNotification({
             userId: request.vendorId,
             title: 'Stock Request Rejected',
             body: `Your request to supply stock has been rejected.`,
             link: '/vendor/stock-requests'
         });
      }

    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update request status.',
      });
    }
  };

  const enhancedRequests = useMemo(() => {
    if (!requests || !users || !outlets) return [];

    const userMap = new Map(users.map(u => [u.uid, u.displayName]));
    const outletMap = new Map(outlets.map(o => [o.id, o.name]));

    return requests.map(req => ({
      ...req,
      vendorName: userMap.get(req.vendorId) || req.vendorId,
      outletName: outletMap.get(req.outletId) || req.outletId,
    })).sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));
  }, [requests, users, outlets]);
  
  const handleViewDetails = (request: StockRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };
  
  const getStatusBadge = (status: StockRequest['status']) => (
    <Badge variant={
        status === 'approved' ? 'default' : 
        status === 'rejected' ? 'destructive' : 'secondary'
      } className={
        `capitalize ${status === 'approved' ? 'bg-green-100 text-green-800' :
        status === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-orange-100 text-orange-800'}`
      }>
        {status === 'approved' ? <CheckCircle className="mr-1 h-3 w-3" /> :
          status === 'rejected' ? <XCircle className="mr-1 h-3 w-3" /> :
          <Clock className="mr-1 h-3 w-3" />
        }
        <span className="capitalize">{status}</span>
    </Badge>
  );

  const renderDesktopSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  const renderMobileSkeleton = () => (
    [...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardFooter className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardFooter>
        </Card>
      ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Stock Requests</h1>
        <Card>
          <CardHeader>
            <CardTitle>Vendor Stock Requests</CardTitle>
            <CardDescription>Approve or reject incoming stock requests from vendors.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Outlet</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? renderDesktopSkeleton() : enhancedRequests.length > 0 ? enhancedRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{req.createdAt?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{req.vendorName}</TableCell>
                      <TableCell>{req.outletName}</TableCell>
                      <TableCell>{req.totalQuantity}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(req)}>
                                View Details
                              </DropdownMenuItem>
                              {req.status === 'pending' && (
                                  <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleStatusChange(req, 'approved')} className="text-green-600 focus:text-green-700">Approve</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(req, 'rejected')} className="text-destructive focus:text-destructive">Reject</DropdownMenuItem>
                                  </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No stock requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="grid md:hidden gap-4">
              {isLoading ? renderMobileSkeleton() : enhancedRequests.length > 0 ? enhancedRequests.map(req => (
                <Card key={req.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle className="text-base">{req.outletName}</CardTitle>
                                <CardDescription>From: {req.vendorName}</CardDescription>
                            </div>
                            {getStatusBadge(req.status)}
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center text-sm">
                        <div>
                            <p className="text-muted-foreground">Items: <span className="font-bold text-foreground">{req.totalQuantity}</span></p>
                            <p className="text-muted-foreground text-xs">Date: {req.createdAt?.toDate().toLocaleDateString()}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(req)}>View Details</DropdownMenuItem>
                              {req.status === 'pending' && (
                                  <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleStatusChange(req, 'approved')} className="text-green-600 focus:text-green-700">Approve</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(req, 'rejected')} className="text-destructive focus:text-destructive">Reject</DropdownMenuItem>
                                  </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </CardFooter>
                </Card>
              )) : (
                 <div className="text-center py-10">No stock requests found.</div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
      {selectedRequest && <RequestDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} request={selectedRequest} />}
    </>
  )
}
