'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, doc, query, updateDoc, where } from 'firebase/firestore';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { UserData } from '@/types/user';
import { Loader2 } from 'lucide-react';

interface AssignSalesRepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: UserData;
}

const formSchema = z.object({
  salesRepId: z.string().nullable(),
});

export function AssignSalesRepDialog({ open, onOpenChange, customer }: AssignSalesRepDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const { data: salesReps, isLoading: isLoadingSalesReps } = useFirestoreQuery<UserData>(
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'sales')) : null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesRepId: customer.managedBy || null,
    },
  });

  useEffect(() => {
    form.reset({
      salesRepId: customer.managedBy || null,
    });
  }, [customer, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    setIsLoading(true);

    try {
      const customerRef = doc(firestore, 'users', customer.uid);
      await updateDoc(customerRef, {
        managedBy: values.salesRepId === 'null' ? null : values.salesRepId,
      });
      
      toast({
        title: "Sales Rep Assigned!",
        description: `${customer.displayName} is now managed by ${values.salesRepId && values.salesRepId !== 'null' ? salesReps?.find(r => r.uid === values.salesRepId)?.displayName : 'no one'}.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not assign sales rep. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Sales Rep</DialogTitle>
          <DialogDescription>
            Assign a sales representative to manage {customer.displayName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="salesRepId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Representative</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger disabled={isLoadingSalesReps}>
                        <SelectValue placeholder="Select a sales rep..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingSalesReps ? (
                        <div className="flex items-center justify-center p-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</div>
                      ) : (
                        <>
                           <SelectItem value="null">None (Unassign)</SelectItem>
                           {salesReps?.map((rep) => (
                             <SelectItem key={rep.uid} value={rep.uid}>
                               {rep.displayName}
                             </SelectItem>
                           ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading || isLoadingSalesReps}>
                {isLoading ? 'Saving...' : 'Save Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
