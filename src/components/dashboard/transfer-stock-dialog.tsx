
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
import { useAuth } from '@/hooks/use-auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';
import type { Product } from '@/types/product';

interface TransferStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product & { stock: number };
  sourceOutletId: string;
}

const formSchema = z.object({
  destinationOutletId: z.string().min(1, 'Destination is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
});

export function TransferStockDialog({ open, onOpenChange, product, sourceOutletId }: TransferStockDialogProps) {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destinationOutletId: '',
            quantity: 1,
        },
    });

    const destinationOutlets = allOutlets?.filter(o => o.id !== sourceOutletId);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: "Authentication Error" });
            return;
        }
        if (values.quantity > product.stock) {
            form.setError('quantity', { message: `Cannot transfer more than available stock (${product.stock}).`});
            return;
        }
        setIsLoading(true);

        try {
            await addDoc(collection(firestore, 'stock_transfers'), {
                sourceOutletId,
                destinationOutletId: values.destinationOutletId,
                productId: product.id,
                productName: product.name,
                variantSku: product.variants[0]?.sku || product.baseSku, // Placeholder
                quantity: values.quantity,
                status: 'requested',
                requestedBy: user.uid,
                createdAt: serverTimestamp(),
            });

            toast({ title: "Transfer Request Created!", description: `Request to transfer ${values.quantity} units of ${product.name} has been logged.` });
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating transfer request:", error);
            toast({ variant: 'destructive', title: "Request Failed", description: "Could not create the transfer request." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Transfer Stock: {product.name}</DialogTitle>
                    <DialogDescription>
                        Available stock in this outlet: <span className="font-bold">{product.stock}</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="destinationOutletId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transfer To</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination outlet" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {outletsLoading ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                destinationOutlets?.map(o => (
                                                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter quantity to transfer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Requesting...' : 'Request Transfer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
