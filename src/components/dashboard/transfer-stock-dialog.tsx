
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
  product: Product;
  sourceOutletId: string;
}

const formSchema = z.object({
  destinationOutletId: z.string().min(1, 'Destination is required.'),
  variantSku: z.string().min(1, 'Please select a product variant.'),
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
            variantSku: '',
            quantity: 1,
        },
    });

    const destinationOutlets = allOutlets?.filter(o => o.id !== sourceOutletId);
    
    const selectedVariantSku = form.watch('variantSku');
    const selectedVariant = product.variants.find(v => v.sku === selectedVariantSku);
    const availableStock = selectedVariant?.outlet_stocks?.[sourceOutletId] ?? 0;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: "Authentication Error" });
            return;
        }
        if (values.quantity > availableStock) {
            form.setError('quantity', { message: `Cannot transfer more than available stock (${availableStock}).`});
            return;
        }
        setIsLoading(true);

        try {
            await addDoc(collection(firestore, 'stock_transfers'), {
                sourceOutletId,
                destinationOutletId: values.destinationOutletId,
                productId: product.id,
                productName: product.name,
                variantSku: values.variantSku,
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
                        Initiate a stock transfer to another outlet.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="variantSku"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Variant</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a variant" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {product.variants.map(v => (
                                                <SelectItem key={v.sku} value={v.sku}>
                                                    {v.color || ''} {v.size || ''} ({v.sku}) - Stock: {v.outlet_stocks?.[sourceOutletId] ?? 0}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="destinationOutletId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transfer To</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select destination outlet" /></SelectTrigger></FormControl>
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
                                    <FormLabel>Quantity (Available: {availableStock})</FormLabel>
                                    <FormControl><Input type="number" placeholder="Enter quantity" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isLoading || !selectedVariant}>
                                {isLoading ? 'Requesting...' : 'Request Transfer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
