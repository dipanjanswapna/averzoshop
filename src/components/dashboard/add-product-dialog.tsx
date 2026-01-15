
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { categoriesData } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string({ required_error: 'Please select a mother category.' }).min(1),
  group: z.string({ required_error: 'Please select a group.' }).min(1),
  subcategory: z.string({ required_error: 'Please select a subcategory.' }).min(1),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  total_stock: z.coerce.number().int().min(0, { message: 'Initial stock must be a positive integer.' }),
  brand: z.string().min(2, { message: 'Brand is required.' }),
  image: z.string().url({ message: 'Please enter a valid image URL.' }),
  sizes: z.string().optional(),
  colors: z.string().optional(),
});

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      total_stock: 0,
      brand: '',
      image: '',
      sizes: '',
      colors: '',
    },
  });

  const selectedCategory = form.watch('category');
  const selectedGroup = form.watch('group');

  const availableGroups = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categoriesData.find(cat => cat.mother_name === selectedCategory);
    return category ? category.groups : [];
  }, [selectedCategory]);

  const availableSubcategories = useMemo(() => {
    if (!selectedGroup) return [];
    const category = categoriesData.find(cat => cat.mother_name === selectedCategory);
    const group = category?.groups.find(g => g.group_name === selectedGroup);
    return group ? group.subs : [];
  }, [selectedCategory, selectedGroup]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user || !userData) {
        toast({ variant: "destructive", title: "Authentication error", description: "You must be logged in to add a product." });
        return;
    }
    setIsLoading(true);
    try {
      const status = userData.role === 'admin' ? 'approved' : 'pending';
      
      await addDoc(collection(firestore, 'products'), {
        name: values.name,
        description: values.description,
        category: values.category,
        group: values.group,
        subcategory: values.subcategory,
        price: values.price,
        total_stock: values.total_stock,
        outlet_stocks: {},
        brand: values.brand,
        image: values.image,
        sizes: values.sizes ? values.sizes.split(',').map(s => s.trim()) : [],
        colors: values.colors ? values.colors.split(',').map(c => c.trim()) : [],
        vendorId: user.uid,
        status: status,
        createdAt: serverTimestamp(),
        discount: 0,
        isBundle: false,
      });

      toast({
        title: status === 'approved' ? "Product Added!" : "Product Submitted!",
        description: status === 'approved' ? `${values.name} is now live.` : `${values.name} has been submitted for approval.`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not add the product. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dialogTitle = userData?.role === 'admin' ? 'Add New Product' : 'Submit Product for Approval';
  const dialogDescription = userData?.role === 'admin' 
    ? 'Fill in the details to add a new product directly to the store.'
    : 'Fill in the details to submit your product. It will be reviewed by an admin.';
  const submitButtonText = userData?.role === 'admin' ? 'Add Product' : 'Submit for Approval';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Classic Cotton T-Shirt" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Category</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('group', ''); form.setValue('subcategory', ''); }} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categoriesData.map(cat => <SelectItem key={cat.mother_name} value={cat.mother_name}>{cat.mother_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
              )} />
               <FormField control={form.control} name="group" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                     <Select onValueChange={(value) => { field.onChange(value); form.setValue('subcategory', ''); }} value={field.value} disabled={!selectedCategory}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Group" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {availableGroups.map(grp => <SelectItem key={grp.group_name} value={grp.group_name}>{grp.group_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
              )} />
               <FormField control={form.control} name="subcategory" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedGroup}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {availableSubcategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input placeholder="e.g., Averzo Basics" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (৳)</FormLabel>
                      <FormControl><Input type="number" placeholder="999" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="total_stock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Total Stock</FormLabel>
                      <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="sizes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes (comma-separated)</FormLabel>
                      <FormControl><Input placeholder="S, M, L, XL" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="colors" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors (comma-separated)</FormLabel>
                      <FormControl><Input placeholder="Red, Blue, Black" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <DialogFooter className="pt-8">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : submitButtonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
