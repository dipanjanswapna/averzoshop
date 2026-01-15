
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AddOutletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Outlet name must be at least 3 characters.' }),
  location: z.string().min(5, { message: 'Location is required.' }),
  status: z.enum(['Active', 'Inactive'], { required_error: 'Please select a status.' }),
});

export function AddOutletDialog({ open, onOpenChange }: AddOutletDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      status: 'Active',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      await addDoc(collection(firestore, 'outlets'), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Outlet Added!",
        description: `${values.name} has been successfully added.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding outlet:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not add the outlet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Outlet</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new physical store location.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outlet Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Averzo Banani" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., House 12, Road 5, Banani, Dhaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Outlet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
