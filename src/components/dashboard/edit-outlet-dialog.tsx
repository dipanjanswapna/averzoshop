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
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import type { Outlet } from '@/types/outlet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const InteractiveMap = dynamic(() => import('@/components/ui/interactive-map'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-[300px] rounded-lg" />
});

interface EditOutletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outlet: Outlet | null;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Outlet name must be at least 3 characters.' }),
  location: z.object({
      address: z.string().min(5, { message: 'Address is required.' }),
      lat: z.coerce.number(),
      lng: z.coerce.number(),
  }),
  status: z.enum(['Active', 'Inactive'])
});

export function EditOutletDialog({ open, onOpenChange, outlet }: EditOutletDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (outlet) {
      form.reset({
        name: outlet.name,
        location: {
            address: outlet.location.address,
            lat: outlet.location.lat,
            lng: outlet.location.lng,
        },
        status: outlet.status,
      });
    }
  }, [outlet, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !outlet) return;
    setIsLoading(true);

    try {
        const outletRef = doc(firestore, 'outlets', outlet.id);
        await updateDoc(outletRef, {
            name: values.name,
            location: values.location,
            status: values.status
        });

      toast({
        title: "Outlet Updated!",
        description: `${values.name} has been successfully updated.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating outlet:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not update the outlet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLocationSelect = (details: { lat: number; lng: number; district: string; area: string; streetAddress: string; }) => {
    form.setValue('location.lat', details.lat, { shouldValidate: true });
    form.setValue('location.lng', details.lng, { shouldValidate: true });
    
    const fullAddress = [details.streetAddress, details.area, details.district].filter(Boolean).join(', ');
    form.setValue('location.address', fullAddress, { shouldValidate: true });
  }
  
  if (!outlet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Outlet: {outlet.name}</DialogTitle>
          <DialogDescription>
            Update the details for this outlet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outlet Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Averzo Banani" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="location.address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address (auto-filled from map)</FormLabel>
                    <FormControl><Input placeholder="e.g., House 12, Road 5, Banani, Dhaka" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
              )} />
            </div>

            <div className="flex flex-col">
              {open && (
                  <InteractiveMap 
                    onLocationSelect={handleLocationSelect} 
                    initialPosition={[outlet.location.lat, outlet.location.lng]}
                  />
              )}
            </div>

            <div className="md:col-span-2">
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
