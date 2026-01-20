
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { PointTransaction } from '@/types/point-transaction';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Award, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function LoyaltyPointsPage() {
  const { user, userData } = useAuth();
  const { firestore } = useFirebase();

  const pointsHistoryQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/points_history`),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: history, isLoading } = useFirestoreQuery<PointTransaction>(pointsHistoryQuery);

  const renderSkeleton = () =>
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
      </TableRow>
    ));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Loyalty Points</h1>
          <p className="text-muted-foreground">Track your earnings and rewards.</p>
        </div>
        <Card className="w-full md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
             <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
             <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{userData?.loyaltyPoints || 0} Points</div>
            <p className="text-xs text-muted-foreground">Equivalent to ৳{((userData?.loyaltyPoints || 0) * 0.20).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A complete log of your points activity.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : history && history.length > 0 ? (
                history.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.createdAt?.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>{tx.reason}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={tx.pointsChange > 0 ? "default" : "destructive"} className={cn("gap-1", tx.pointsChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                         {tx.pointsChange > 0 ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                         {tx.pointsChange > 0 ? `+${tx.pointsChange}` : tx.pointsChange}
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No transactions found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
