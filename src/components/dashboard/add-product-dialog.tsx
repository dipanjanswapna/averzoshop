
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { categoriesData } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trash2 } from 'lucide-react';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
});

const formSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string({ required_error: 'Please select a mother category.' }).min(1),
  group: z.string({ required_error: 'Please select a group.' }).min(1),
  subcategory: z.string({ required_error: 'Please select a subcategory.' }).min(1),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  compareAtPrice: z.coerce.number().min(0).optional(),
  baseSku: z.string().min(1, { message: 'Base SKU is required.' }),
  brand: z.string().min(2, { message: 'Brand is required.' }),
  image: z.string().url({ message: 'Please enter a valid image URL.' }),
  variantSizes: z.string().optional(),
  variantColors: z.string().optional(),
  variants: z.array(variantSchema).min(1, 'At least one variant is required.'),
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
      compareAtPrice: 0,
      baseSku: '',
      brand: '',
      image: '',
      variantSizes: '',
      variantColors: '',
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
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

  const handleGenerateVariants = () => {
    const { variantColors, variantSizes, baseSku, price, compareAtPrice } = form.getValues();
    const colors = variantColors?.split(',').map(c => c.trim()).filter(Boolean) || [];
    const sizes = variantSizes?.split(',').map(s => s.trim()).filter(Boolean) || [];
    
    remove(); // Clear existing variants

    if (colors.length === 0 && sizes.length === 0) {
      append({ sku: `${baseSku}-DEFAULT`, color: '', size: '', stock: 0, price, compareAtPrice });
      return;
    }

    if (colors.length > 0 && sizes.length === 0) {
      colors.forEach(color => {
        append({ sku: `${baseSku}-${color.toUpperCase()}`, color, size: '', stock: 0, price, compareAtPrice });
      });
      return;
    }
    
    if (colors.length === 0 && sizes.length > 0) {
      sizes.forEach(size => {
        append({ sku: `${baseSku}-${size.toUpperCase()}`, color: '', size, stock: 0, price, compareAtPrice });
      });
      return;
    }

    colors.forEach(color => {
      sizes.forEach(size => {
        append({ sku: `${baseSku}-${color.toUpperCase()}-${size.toUpperCase()}`, color, size, stock: 0, price, compareAtPrice });
      });
    });
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user || !userData) {
        toast({ variant: "destructive", title: "Authentication error", description: "You must be logged in to add a product." });
        return;
    }
    setIsLoading(true);
    try {
      const status = userData.role === 'admin' ? 'approved' : 'pending';
      const totalStock = values.variants.reduce((sum, v) => sum + v.stock, 0);
      
      const { price, compareAtPrice } = values;
      let discount = 0;
      if (compareAtPrice && compareAtPrice > price) {
          discount = ((compareAtPrice - price) / compareAtPrice) * 100;
      }

      await addDoc(collection(firestore, 'products'), {
        name: values.name,
        description: values.description,
        category: values.category,
        group: values.group,
        subcategory: values.subcategory,
        price: values.price,
        compareAtPrice: values.compareAtPrice || null,
        discount: Math.round(discount),
        baseSku: values.baseSku,
        total_stock: totalStock,
        variants: values.variants,
        outlet_stocks: {},
        brand: values.brand,
        image: values.image,
        colors: values.variantColors?.split(',').map(s => s.trim()).filter(Boolean) || [],
        sizes: values.variantSizes?.split(',').map(c => c.trim()).filter(Boolean) || [],
        vendorId: user.uid,
        status: status,
        createdAt: serverTimestamp(),
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Classic Cotton T-Shirt" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Mother Category</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('group', ''); form.setValue('subcategory', ''); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl><SelectContent>{categoriesData.map(cat => <SelectItem key={cat.mother_name} value={cat.mother_name}>{cat.mother_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="group" render={({ field }) => (
                  <FormItem><FormLabel>Group</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('subcategory', ''); }} value={field.value} disabled={!selectedCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select Group" /></SelectTrigger></FormControl><SelectContent>{availableGroups.map(grp => <SelectItem key={grp.group_name} value={grp.group_name}>{grp.group_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="subcategory" render={({ field }) => (
                  <FormItem><FormLabel>Subcategory</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedGroup}><FormControl><SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger></FormControl><SelectContent>{availableSubcategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g., Averzo Basics" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (৳)</FormLabel><FormControl><Input type="number" placeholder="999" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="compareAtPrice" render={({ field }) => (<FormItem><FormLabel>Compare-at Price (MRP ৳)</FormLabel><FormControl><Input type="number" placeholder="1299" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="baseSku" render={({ field }) => (<FormItem><FormLabel>Base SKU</FormLabel><FormControl><Input placeholder="AV-TSH-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Generate Variants</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="variantColors" render={({ field }) => (<FormItem><FormLabel>Colors (comma-separated)</FormLabel><FormControl><Input placeholder="Red, Blue, Black" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="variantSizes" render={({ field }) => (<FormItem><FormLabel>Sizes (comma-separated)</FormLabel><FormControl><Input placeholder="S, M, L, XL" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="button" onClick={handleGenerateVariants}>Generate Variants</Button>
            </div>
            
            {fields.length > 0 && (
              <div className="space-y-2">
                <Label>Product Variants</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price (৳)</TableHead>
                      <TableHead>Compare-at (MRP ৳)</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.color || 'N/A'}</TableCell>
                        <TableCell>{field.size || 'N/A'}</TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.sku`} render={({ field }) => (<Input {...field} />)} /></TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (<Input type="number" {...field} />)} /></TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (<Input type="number" {...field} />)} /></TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.compareAtPrice`} render={({ field }) => (<Input type="number" {...field} />)} /></TableCell>
                        <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
             {form.formState.errors.variants && <p className="text-sm font-medium text-destructive">{form.formState.errors.variants.message}</p>}


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
