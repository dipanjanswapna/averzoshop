
'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import { Trash2, PlusCircle } from 'lucide-react';
import type { Outlet } from '@/types/outlet';

interface CreateStockRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const itemSchema = z.object({
    productId: z.string().min(1, 'Product must be selected'),
    productName: z.string(),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

const formSchema = z.object({
  outletId: z.string({ required_error: 'Please select an outlet.' }).min(1),
  items: z.array(itemSchema).min(1, 'At least one product is required.'),
});

export function CreateStockRequestDialog({ open, onOpenChange }: CreateStockRequestDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuth();

  const { data: allOutlets, isLoading: isLoadingOutlets } = useFirestoreQuery<Outlet>('outlets');
  const { data: vendorProducts, isLoading: isLoadingProducts } = useFirestoreQuery<Product>(`products`);

  const assignedOutlets = useMemo(() => {
    if (!allOutlets || !userData?.assignedOutlets) {
      return [];
    }
    return allOutlets.filter(outlet => userData.assignedOutlets?.includes(outlet.id));
  }, [allOutlets, userData]);

  const availableProducts = useMemo(() => {
    return vendorProducts?.filter(p => p.vendorId === user?.uid) || [];
  }, [vendorProducts, user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outletId: '',
      items: [{ productId: '', productName: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user) return;
    setIsLoading(true);

    try {
        const totalQuantity = values.items.reduce((sum, item) => sum + item.quantity, 0);

        await addDoc(collection(firestore, 'stock_requests'), {
            vendorId: user.uid,
            outletId: values.outletId,
            items: values.items,
            totalQuantity,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        
      toast({
        title: "Stock Request Submitted!",
        description: "Your request has been sent to the admin for approval.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not submit your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Stock Request</DialogTitle>
          <DialogDescription>
            Request to supply stock to an outlet. This will require admin approval.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField
              control={form.control}
              name="outletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Outlet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an outlet to supply to" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingOutlets ? (
                          <SelectItem value="loading" disabled>Loading outlets...</SelectItem>
                      ) : assignedOutlets.length > 0 ? (
                          assignedOutlets.map((outlet) => (
                              <SelectItem key={outlet.id} value={outlet.id}>
                                  {outlet.name}
                              </SelectItem>
                          ))
                      ) : (
                          <SelectItem value="no-outlets" disabled>No outlets assigned to you.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
                <FormLabel>Products</FormLabel>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                        <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select 
                                        onValueChange={(value) => {
                                            const selectedProduct = availableProducts.find(p => p.id === value);
                                            field.onChange(value);
                                            form.setValue(`items.${index}.productName`, selectedProduct?.name || '');
                                        }} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingProducts ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                availableProducts.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="w-24">
                                    <FormControl>
                                        <Input type="number" placeholder="Qty" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ productId: '', productName: '', quantity: 1 })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Product
                </Button>
                {form.formState.errors.items && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
                )}
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
