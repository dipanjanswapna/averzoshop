'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { categoriesData } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import { CreatableSelect } from '../ui/creatable-select';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';


interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  color: z.string().optional(),
  size: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
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
  giftWithPurchase: z.object({
    enabled: z.boolean().default(false),
    description: z.string().optional(),
  }).optional(),
  preOrder: z.object({
    enabled: z.boolean().default(false),
    releaseDate: z.date().optional(),
    depositType: z.enum(['percentage', 'fixed']).optional(),
    depositAmount: z.coerce.number().optional(),
    limit: z.coerce.number().int().optional(),
  }).optional(),
  flashSale: z.object({
    enabled: z.boolean().default(false),
    endDate: z.date().optional(),
  }).optional(),
});

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: allProducts, isLoading: isLoadingProducts } = useFirestoreQuery<Product>('products');

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
      giftWithPurchase: {
        enabled: false,
        description: '',
      },
      preOrder: {
        enabled: false,
      },
      flashSale: {
        enabled: false,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const selectedCategory = form.watch('category');
  const giftEnabled = form.watch('giftWithPurchase.enabled');
  const preOrderEnabled = form.watch('preOrder.enabled');
  const flashSaleEnabled = form.watch('flashSale.enabled');

  const availableGroups = useMemo(() => {
    if (!allProducts || !selectedCategory) return [];
    const groups = allProducts
        .filter(p => p.category === selectedCategory && p.group)
        .map(p => p.group);
    return [...new Set(groups)].map(g => ({ value: g, label: g }));
  }, [allProducts, selectedCategory]);

  const availableSubcategories = useMemo(() => {
    if (!allProducts || !selectedCategory) return [];
    const subcats = allProducts
        .filter(p => p.category === selectedCategory && p.subcategory)
        .map(p => p.subcategory);
    return [...new Set(subcats)].map(s => ({ value: s, label: s }));
  }, [allProducts, selectedCategory]);

  const handleGenerateVariants = () => {
    const { variantColors, variantSizes, baseSku, price, compareAtPrice } = form.getValues();
    const colors = variantColors?.split(',').map(c => c.trim()).filter(Boolean) || [];
    const sizes = variantSizes?.split(',').map(s => s.trim()).filter(Boolean) || [];
    
    remove(); // Clear existing variants

    const newCompareAtPrice = compareAtPrice ?? 0;

    if (colors.length === 0 && sizes.length === 0) {
      append({ sku: `${baseSku}-DEFAULT`, color: '', size: '', image: '', stock: 0, price, compareAtPrice: newCompareAtPrice });
      return;
    }

    if (colors.length > 0 && sizes.length === 0) {
      colors.forEach(color => {
        append({ sku: `${baseSku}-${color.toUpperCase()}`, color, size: '', image: '', stock: 0, price, compareAtPrice: newCompareAtPrice });
      });
      return;
    }
    
    if (colors.length === 0 && sizes.length > 0) {
      sizes.forEach(size => {
        append({ sku: `${baseSku}-${size.toUpperCase()}`, color: '', size: '', image: '', stock: 0, price, compareAtPrice: newCompareAtPrice });
      });
      return;
    }

    colors.forEach(color => {
      sizes.forEach(size => {
        append({ sku: `${baseSku}-${color.toUpperCase()}-${size.toUpperCase()}`, color, size, image: '', stock: 0, price, compareAtPrice: newCompareAtPrice });
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
      const totalStock = 0; // Always 0 on creation
      
      const { price, compareAtPrice } = values;
      let discount = 0;
      if (compareAtPrice && compareAtPrice > price) {
          discount = ((compareAtPrice - price) / price) * 100;
      }
      
      const productData = {
        name: values.name,
        description: values.description,
        category: values.category,
        group: values.group,
        subcategory: values.subcategory,
        price: values.price,
        compareAtPrice: values.compareAtPrice ?? null,
        discount: Math.round(discount),
        baseSku: values.baseSku,
        total_stock: totalStock,
        variants: values.variants.map(v => ({...v, stock: 0, outlet_stocks: {}})),
        image: values.image,
        colors: values.variantColors?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
        sizes: values.variantSizes?.split(',').map(c => c.trim()).filter(Boolean) ?? [],
        giftWithPurchase: values.giftWithPurchase?.enabled
          ? { enabled: true, description: values.giftWithPurchase.description ?? "" }
          : { enabled: false, description: "" },
        preOrder: values.preOrder?.enabled
          ? { enabled: true, releaseDate: values.preOrder.releaseDate ?? null, depositType: values.preOrder.depositType ?? null, depositAmount: values.preOrder.depositAmount ?? null, limit: values.preOrder.limit ?? null }
          : { enabled: false, releaseDate: null, depositType: null, depositAmount: null, limit: null },
        flashSale: values.flashSale?.enabled
          ? { enabled: true, endDate: values.flashSale.endDate ?? null }
          : { enabled: false, endDate: null },
        vendorId: user.uid,
        status: status,
        createdAt: serverTimestamp(),
        isBundle: false,
        brand: values.brand
      };


      await addDoc(collection(firestore, 'products'), productData);

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

  const dialogTitle = 'Add New Product';
  const dialogDescription = 'Fill in the details to add a new product to the store.';
  const submitButtonText = 'Add Product';

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
                <FormItem><FormLabel>Group</FormLabel>
                <CreatableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={availableGroups}
                    placeholder="Select or create a group"
                    disabled={!selectedCategory || isLoadingProducts}
                />
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="subcategory" render={({ field }) => (
                <FormItem><FormLabel>Subcategory</FormLabel>
                <CreatableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={availableSubcategories}
                    placeholder="Select or create a subcategory"
                    disabled={!selectedCategory || isLoadingProducts}
                />
                <FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g., Averzo Basics" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Main Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Base Price (৳)</FormLabel><FormControl><Input type="number" placeholder="999" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="compareAtPrice" render={({ field }) => (<FormItem><FormLabel>Base Compare-at Price (MRP ৳)</FormLabel><FormControl><Input type="number" placeholder="1299" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                <label className="text-sm font-medium">Product Variants</label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Image URL</TableHead>
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
                        <TableCell><FormField control={form.control} name={`variants.${index}.image`} render={({ field }) => (<Input placeholder="https://..." {...field} />)} /></TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                value={0}
                                readOnly
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (<Input type="number" {...field} />)} /></TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.compareAtPrice`} render={({ field }) => (<Input type="number" {...field} value={field.value ?? ''} />)} /></TableCell>
                        <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {form.formState.errors.variants && <p className="text-sm font-medium text-destructive">{form.formState.errors.variants.message}</p>}

             <div className="space-y-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="giftWithPurchase.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Gift with Purchase</FormLabel>
                        <FormDescription>
                          Enable this to offer a free gift with this product.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {giftEnabled && (
                  <FormField
                    control={form.control}
                    name="giftWithPurchase.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gift Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Free leather wallet with this purchase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>

             <div className="space-y-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="preOrder.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Pre-order</FormLabel>
                        <FormDescription>
                          Allow customers to order this product before it's in stock.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {preOrderEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                      <FormField
                          control={form.control}
                          name="preOrder.releaseDate"
                          render={({ field }) => (
                          <FormItem className="flex flex-col"><FormLabel>Release Date</FormLabel>
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
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                              </Popover>
                              <FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                          <FormField
                              control={form.control}
                              name="preOrder.depositType"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Deposit Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                                          <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="preOrder.depositAmount"
                              render={({ field }) => (
                                  <FormItem><FormLabel>Deposit Amount</FormLabel><FormControl><Input type="number" placeholder="e.g., 20 or 500" {...field} /></FormControl><FormMessage /></FormItem>
                              )}
                          />
                      </div>
                       <FormField
                          control={form.control}
                          name="preOrder.limit"
                          render={({ field }) => (
                              <FormItem><FormLabel>Pre-order Limit</FormLabel><FormControl><Input type="number" placeholder="Max pre-orders" {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                      />
                  </div>
                )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="flashSale.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Flash Sale</FormLabel>
                        <FormDescription>
                          Create urgency with a limited-time offer.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {flashSaleEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                      <FormField
                          control={form.control}
                          name="flashSale.endDate"
                          render={({ field }) => (
                          <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                              <Popover>
                              <PopoverTrigger asChild>
                                  <FormControl>
                                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                      {field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                  </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                              </Popover>
                              <FormMessage /></FormItem>
                      )} />
                  </div>
                )}
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
