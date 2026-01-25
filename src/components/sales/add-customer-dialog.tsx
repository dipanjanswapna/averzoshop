
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
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  phone: z.string().min(11, { message: 'A valid 11-digit phone number is required.' }),
  streetAddress: z.string().min(1, 'Street address is required.'),
  area: z.string().min(1, 'Area/Post Office is required.'),
  district: z.string().min(1, 'District is required.'),
});

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      streetAddress: '',
      area: '',
      district: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "Authentication Error" });
        return;
    };
    setIsLoading(true);

    try {
      const newCustomerRef = doc(collection(firestore, 'users'));
      await addDoc(collection(firestore, 'users'), {
        uid: newCustomerRef.id,
        displayName: values.name,
        email: values.email,
        phone: values.phone,
        addresses: [{
            id: Date.now().toString(),
            label: 'Primary',
            name: values.name,
            phone: values.phone,
            streetAddress: values.streetAddress,
            area: values.area,
            district: values.district,
        }],
        role: 'customer',
        status: 'approved',
        managedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      
      toast({ title: "Customer Added!", description: `${values.name} has been added to your customer list.` });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to add customer", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Add a new customer to your managed list.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
             <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="customer@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="streetAddress" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="House/Apt No., Street" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="area" render={({ field }) => (<FormItem><FormLabel>Area</FormLabel><FormControl><Input placeholder="e.g., Banani" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="e.g., Dhaka" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Add Customer'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
