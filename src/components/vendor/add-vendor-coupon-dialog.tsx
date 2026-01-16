'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface AddVendorCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  code: z.string().min(3, { message: 'Code must be at least 3 characters.' }).transform(val => val.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed'], { required_error: 'Please select a discount type.' }),
  value: z.coerce.number().min(1, 'Value must be greater than 0.'),
  minimumSpend: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().min(1, 'Usage limit must be at least 1.'),
  expiryDate: z.date({ required_error: "An expiry date is required." }),
  applicableProducts: z.array(z.string()).optional(),
});

export function AddVendorCouponDialog({ open, onOpenChange }: AddVendorCouponDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  
  const vendorProducts = useMemo(() => {
    if (!allProducts || !user) return [];
    return allProducts.filter(p => p.vendorId === user.uid);
  }, [allProducts, user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      value: 10,
      minimumSpend: 0,
      usageLimit: 100,
      applicableProducts: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "Authentication Error" });
        return;
    };
    setIsLoading(true);

    try {
        const couponRef = doc(firestore, 'coupons', values.code);
        const couponSnap = await getDoc(couponRef);
        if (couponSnap.exists()) {
            toast({ variant: "destructive", title: "Coupon code already exists", description: "Please choose a unique code." });
            setIsLoading(false);
            return;
        }

        const couponData = {
            id: values.code,
            ...values,
            expiryDate: Timestamp.fromDate(values.expiryDate),
            creatorType: 'vendor' as const,
            creatorId: user.uid,
            usedCount: 0,
            createdAt: serverTimestamp(),
            applicableProducts: values.applicableProducts || [], 
        };
        
        await setDoc(couponRef, couponData);
        
        toast({ title: "Coupon Created!", description: `Code ${values.code} has been added for your products.` });
        form.reset();
        onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to create coupon", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>Create a new promotional code for your products.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input placeholder="e.g., MYSHOP10" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="discountType" render={({ field }) => (
                  <FormItem><FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount (৳)</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" placeholder="e.g., 10 or 100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="minimumSpend" render={({ field }) => (
                <FormItem><FormLabel>Minimum Spend (৳)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="usageLimit" render={({ field }) => (
                <FormItem><FormLabel>Usage Limit</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="expiryDate" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Expiry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || date < new Date("1900-01-01")} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage /></FormItem>
            )} />

             <FormField
                control={form.control}
                name="applicableProducts"
                render={() => (
                <FormItem>
                    <div className="mb-4">
                    <FormLabel className="text-base">Applicable Products</FormLabel>
                    <FormDescription>
                        Select specific products for this coupon. If none are selected, it will apply to all your products.
                    </FormDescription>
                    </div>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                        {productsLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                           vendorProducts.map((product) => (
                            <FormField
                                key={product.id}
                                control={form.control}
                                name="applicableProducts"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={product.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(product.id)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...(field.value || []), product.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== product.id
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                        {product.name}
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
            
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Coupon'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
