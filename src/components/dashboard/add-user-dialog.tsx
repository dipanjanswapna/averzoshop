
'use client';

import { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['customer', 'vendor', 'rider', 'outlet', 'admin'], { required_error: 'Please select a role.' }),
  assignedOutlets: z.array(z.string()).optional(),
});

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const { toast } = useToast();
  const { firestore, auth } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const { data: outlets, isLoading: isLoadingOutlets } = useFirestoreQuery<Outlet>('outlets');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer',
      assignedOutlets: [],
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !auth) {
        toast({ variant: "destructive", title: "Firebase not initialized", description: "Please try again." });
        return;
    };
    setIsLoading(true);

    try {
        // 1. Create the Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        // 2. Update Auth profile with display name
        await updateProfile(user, { displayName: values.name });

        // 3. Create the user document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        const userData: any = {
            uid: user.uid,
            email: values.email,
            displayName: values.name,
            role: values.role,
            status: 'approved', // Admin-created users are pre-approved
            createdAt: new Date().toISOString(),
            loyaltyPoints: 0,
            totalSpent: 0,
            membershipTier: 'silver',
        };

        if (values.role === 'vendor' && values.assignedOutlets) {
            userData.assignedOutlets = values.assignedOutlets;
        }

        await setDoc(userDocRef, userData);

      toast({
        title: "User Created!",
        description: `An account for ${values.name} has been successfully created.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      let errorMessage = "Could not create the user. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
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
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign a role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Set Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="rider">Rider</SelectItem>
                        <SelectItem value="outlet">Outlet Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select><FormMessage /></FormItem>
            )} />

            {selectedRole === 'vendor' && (
                <FormField
                control={form.control}
                name="assignedOutlets"
                render={() => (
                  <FormItem className="pt-4 border-t">
                    <FormLabel className="font-bold">Assign Outlets to Vendor</FormLabel>
                     <ScrollArea className="h-48 rounded-md border p-4">
                       {isLoadingOutlets ? (
                         <div className="space-y-2">
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-full" />
                         </div>
                       ) : (
                         outlets?.map((outlet) => (
                          <FormField
                            key={outlet.id}
                            control={form.control}
                            name="assignedOutlets"
                            render={({ field }) => (
                                <FormItem key={outlet.id} className="flex flex-row items-start space-x-3 space-y-0 my-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(outlet.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), outlet.id])
                                          : field.onChange(field.value?.filter((value) => value !== outlet.id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{outlet.name}</FormLabel>
                                </FormItem>
                              )
                            }
                          />
                        ))
                       )}
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating User...' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    