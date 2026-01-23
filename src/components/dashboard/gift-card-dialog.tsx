
'use client';

import { useState, useEffect } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { CalendarIcon, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GiftCard } from '@/types/gift-card';
import { createGiftCard } from '@/actions/gift-card-actions';

interface GiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardToEdit?: GiftCard | null;
}

const formSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters.').optional().or(z.literal('')),
  initialValue: z.coerce.number().min(100, 'Value must be at least 100 BDT.'),
  expiryDate: z.date({ required_error: "An expiry date is required." }),
  recipientEmail: z.string().email('Invalid email address.').optional().or(z.literal('')),
  senderName: z.string().optional(),
  message: z.string().optional(),
});

export function GiftCardDialog({ open, onOpenChange, cardToEdit }: GiftCardDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (cardToEdit) {
        // Editing logic here if needed in future
    } else {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        form.reset({
            code: '',
            initialValue: 500,
            expiryDate: futureDate,
            recipientEmail: '',
            senderName: '',
            message: '',
        });
    }
  }, [cardToEdit, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
        const result = await createGiftCard({
            code: values.code || undefined,
            value: values.initialValue,
            expiryDate: values.expiryDate,
            recipientEmail: values.recipientEmail || undefined,
            senderName: values.senderName || undefined,
            message: values.message || undefined,
        });

        if (result.success) {
            toast({
                title: "Gift Card Created!",
                description: `Code ${result.code} has been successfully created.`,
            });
            form.reset();
            onOpenChange(false);
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to create gift card", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{cardToEdit ? 'Edit Gift Card' : 'Create New Gift Card'}</DialogTitle>
          <DialogDescription>
            Fill in the details to issue a new digital gift card.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField control={form.control} name="initialValue" render={({ field }) => (
                <FormItem><FormLabel>Value (BDT)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
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
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Custom Code (Optional)</FormLabel><FormControl><Input placeholder="Leave blank to auto-generate" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="recipientEmail" render={({ field }) => (
                <FormItem><FormLabel>Recipient's Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="friend@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="senderName" render={({ field }) => (
                <FormItem><FormLabel>Sender's Name (Optional)</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem><FormLabel>Message (Optional)</FormLabel><FormControl><Textarea placeholder="Happy Birthday!" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Gift Card'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
