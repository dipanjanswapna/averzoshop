
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
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface AddOutletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  outletName: z.string().min(3, { message: 'Outlet name must be at least 3 characters.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  managerName: z.string().min(2, { message: 'Manager name is required.' }),
  managerEmail: z.string().email({ message: 'A valid email is required.' }),
  managerPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function AddOutletDialog({ open, onOpenChange }: AddOutletDialogProps) {
  const { toast } = useToast();
  const { firestore, auth } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outletName: '',
      address: '',
      latitude: 0,
      longitude: 0,
      managerName: '',
      managerEmail: '',
      managerPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !auth) {
        toast({ variant: "destructive", title: "Firebase not initialized", description: "Please try again." });
        return;
    };
    setIsLoading(true);

    try {
        // 1. Create the outlet document to get an ID
        const outletRef = await addDoc(collection(firestore, 'outlets'), {
            name: values.outletName,
            location: {
                address: values.address,
                lat: values.latitude,
                lng: values.longitude,
            },
            status: 'Active',
            createdAt: serverTimestamp(),
        });
        const outletId = outletRef.id;

        // 2. Create the Firebase Auth user for the manager
        const userCredential = await createUserWithEmailAndPassword(auth, values.managerEmail, values.managerPassword);
        const user = userCredential.user;

        // 3. Create the user document in Firestore
        await setDoc(doc(firestore, "users", user.uid), {
            uid: user.uid,
            email: values.managerEmail,
            displayName: values.managerName,
            role: 'outlet',
            status: 'approved',
            outletId: outletId, // Link user to the outlet
            createdAt: new Date().toISOString()
        });
        
        // 4. Update the outlet with the manager's UID
        await setDoc(outletRef, { managerId: user.uid }, { merge: true });


      toast({
        title: "Outlet & Manager Account Created!",
        description: `${values.outletName} has been added and an account for ${values.managerName} has been created.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating outlet:", error);
      let errorMessage = "Could not create the outlet. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email for the manager.';
      }
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Outlet</DialogTitle>
          <DialogDescription>
            Create a new physical store and its manager's account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
             <h4 className="text-sm font-bold text-muted-foreground">Outlet Details</h4>
            <FormField control={form.control} name="outletName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Outlet Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Averzo Banani" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl><Input placeholder="e.g., House 12, Road 5, Banani, Dhaka" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="latitude" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl><Input type="number" step="any" placeholder="23.7937" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="longitude" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl><Input type="number" step="any" placeholder="90.4066" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>

            <h4 className="text-sm font-bold text-muted-foreground pt-4 border-t">Manager Account Details</h4>
             <FormField control={form.control} name="managerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager&apos;s Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="managerEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager&apos;s Email</FormLabel>
                  <FormControl><Input type="email" placeholder="manager@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="managerPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Set Temporary Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />


            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Outlet & Account'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
