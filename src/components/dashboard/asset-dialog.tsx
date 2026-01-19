
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { StoreAsset } from '@/types/store-asset';
import { categoriesData } from '@/lib/categories';

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetToEdit?: StoreAsset | null;
}

const formSchema = z.object({
  id: z.string().min(3, { message: 'Asset ID must be at least 3 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  description: z.string().optional(),
  imageHint: z.string().optional(),
  link: z.string().optional(),
  assetType: z.enum(['hero-carousel', 'promo-banner']),
  categorySlug: z.string().min(1, 'Category is required.'),
});

export function AssetDialog({ open, onOpenChange, assetToEdit }: AssetDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      imageUrl: '',
      description: '',
      imageHint: '',
      link: '',
      assetType: 'hero-carousel',
      categorySlug: 'home',
    },
  });

  useEffect(() => {
    if (assetToEdit) {
      form.reset(assetToEdit);
    } else {
      form.reset({
        id: '', imageUrl: '', description: '', imageHint: '', link: '', assetType: 'hero-carousel', categorySlug: 'home',
      });
    }
  }, [assetToEdit, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    setIsLoading(true);

    try {
      const assetRef = doc(firestore, 'store_assets', values.id);
      await setDoc(assetRef, values, { merge: !!assetToEdit });

      toast({ title: `Asset ${assetToEdit ? 'Updated' : 'Created'}!`, description: `Asset ${values.id} has been saved.` });
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to save asset", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const categorySlugs = ['home', ...categoriesData.map(c => c.path.replace('/', ''))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{assetToEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>Manage a visual asset for your storefront.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField control={form.control} name="id" render={({ field }) => (
              <FormItem>
                <FormLabel>Asset ID</FormLabel>
                <FormControl><Input placeholder="e.g., hero-carousel-mens-fashion-1" {...field} disabled={!!assetToEdit} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl><Input placeholder="https://your-host.com/image.jpg" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="assetType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="hero-carousel">Hero Carousel</SelectItem>
                      <SelectItem value="promo-banner">Promo Banner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="categorySlug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categorySlugs.map(slug => (
                        <SelectItem key={slug} value={slug}>{slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description (for accessibility)</FormLabel>
                <FormControl><Input placeholder="A stylish man in a jacket" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem>
                <FormLabel>Link URL (optional)</FormLabel>
                <FormControl><Input placeholder="/mens-fashion" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="imageHint" render={({ field }) => (
              <FormItem>
                <FormLabel>Image Hint (for AI)</FormLabel>
                <FormControl><Input placeholder="e.g., male fashion" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Asset'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

  