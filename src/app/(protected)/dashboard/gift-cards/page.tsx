
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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { GiftCardDialog } from '@/components/dashboard/gift-card-dialog';
import type { GiftCard } from '@/types/gift-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function GiftCardsPage() {
  const { data: giftCards, isLoading } = useFirestoreQuery<GiftCard>('gift_cards');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<GiftCard | null>(null);

  const sortedCards = useMemo(() => {
    if (!giftCards) return [];
    return [...giftCards].sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
  }, [giftCards]);

  const handleEdit = (card: GiftCard) => {
    setCardToEdit(card);
    setIsDialogOpen(true);
  }

  const handleAddNew = () => {
    setCardToEdit(null);
    setIsDialogOpen(true);
  }

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Gift Cards</h1>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Gift Card
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Gift Card Management</CardTitle>
            <CardDescription>Create, view, and manage digital gift cards.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Initial Value</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : sortedCards.length > 0 ? (
                  sortedCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium font-mono text-primary">{card.code}</TableCell>
                      <TableCell className="font-bold">৳{card.balance.toFixed(2)}</TableCell>
                      <TableCell>৳{card.initialValue.toFixed(2)}</TableCell>
                      <TableCell>{card.expiryDate.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>
                         <Badge variant={card.isEnabled ? 'secondary' : 'destructive'} className={cn(card.isEnabled && 'bg-green-100 text-green-800')}>
                            {card.isEnabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No gift cards found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <GiftCardDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} cardToEdit={cardToEdit} />
    </>
  );
}
