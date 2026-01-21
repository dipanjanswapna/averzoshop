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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import type { UserData } from '@/types/user';
import { adjustUserPoints } from '@/actions/admin-actions';
import { Loader2 } from 'lucide-react';

interface AdjustPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
}

const formSchema = z.object({
  pointsChange: z.coerce.number().int().refine(val => val !== 0, { message: "Change cannot be zero." }),
  reason: z.string().min(5, { message: 'Reason must be at least 5 characters.' }),
});

export function AdjustPointsDialog({ open, onOpenChange, user }: AdjustPointsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pointsChange: 0,
      reason: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsLoading(true);

    try {
        const result = await adjustUserPoints(user.uid, values.pointsChange, values.reason);

        if (result.success) {
            toast({
                title: "Points Adjusted!",
                description: `Successfully adjusted points for ${user.displayName}.`,
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
        description: error.message || "Could not adjust points. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Loyalty Points</DialogTitle>
          <DialogDescription>
            Manually add or remove points for {user?.displayName}. Use a negative number to subtract points.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pointsChange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points to Add/Subtract</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 100 or -50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Adjustment</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Customer service gesture" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Confirm Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
