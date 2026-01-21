
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
import type { UserData } from '@/types/user';
import { setCardPromoDiscount } from '@/actions/admin-actions';
import { Loader2 } from 'lucide-react';

interface SetCardPromoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
}

const formSchema = z.object({
  discount: z.coerce.number().min(0, "Discount cannot be negative.").max(100, "Discount cannot exceed 100."),
});

export function SetCardPromoDialog({ open, onOpenChange, user }: SetCardPromoDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discount: 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('discount', user.cardPromoDiscount || 0);
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsLoading(true);

    try {
        const result = await setCardPromoDiscount(user.uid, values.discount);

        if (result.success) {
            toast({
                title: "Promo Discount Set!",
                description: `Successfully set discount for ${user.displayName}.`,
            });
            form.reset();
            onOpenChange(false);
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not set promo discount.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Card Promo Discount</DialogTitle>
          <DialogDescription>
            Assign a special discount percentage for {user.displayName}. Set to 0 to remove.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage (%)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 15" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Set Discount'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
