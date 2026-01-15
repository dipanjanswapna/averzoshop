
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { UserData } from '@/types/user';
import type { Outlet } from '@/types/outlet';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface ManageVendorOutletsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: UserData;
}

const formSchema = z.object({
  outletIds: z.array(z.string()).default([]),
});

export function ManageVendorOutletsDialog({ open, onOpenChange, vendor }: ManageVendorOutletsDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const { data: outlets, isLoading: isLoadingOutlets } = useFirestoreQuery<Outlet>('outlets');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outletIds: vendor.assignedOutlets || [],
    },
  });

  useEffect(() => {
    form.reset({
      outletIds: vendor.assignedOutlets || [],
    });
  }, [vendor, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    setIsLoading(true);

    try {
        const vendorRef = doc(firestore, 'users', vendor.uid);
        await updateDoc(vendorRef, {
            assignedOutlets: values.outletIds
        });
        
      toast({
        title: "Vendor Updated",
        description: `${vendor.displayName}'s assigned outlets have been updated.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update assigned outlets. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Outlets for {vendor.displayName}</DialogTitle>
          <DialogDescription>
            Select the outlets this vendor is allowed to supply products to.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="outletIds"
              render={() => (
                <FormItem>
                  <FormLabel>Available Outlets</FormLabel>
                   <ScrollArea className="h-64 rounded-md border p-4">
                     {isLoadingOutlets ? (
                       <div className="space-y-2">
                         <Skeleton className="h-6 w-full" />
                         <Skeleton className="h-6 w-full" />
                         <Skeleton className="h-6 w-full" />
                       </div>
                     ) : (
                       outlets?.map((outlet) => (
                        <FormField
                          key={outlet.id}
                          control={form.control}
                          name="outletIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={outlet.id}
                                className="flex flex-row items-start space-x-3 space-y-0 my-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(outlet.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), outlet.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== outlet.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {outlet.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))
                     )}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
