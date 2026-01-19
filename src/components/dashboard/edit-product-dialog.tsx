'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { categoriesData } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Product, ProductVariant } from '@/types/product';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CalendarIcon, Trash2, PlusCircle, Sparkles, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { CreatableSelect } from '../ui/creatable-select';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { generateProductDescription } from '@/ai/flows/product-description-generator';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
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
  keywords: z.string().optional(),
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
  specifications: z.array(z.object({
    key: z.string().min(1, "Key cannot be empty"),
    value: z.string().min(1, "Value cannot be empty"),
  })).optional(),
  gallery: z.array(z.object({
    url: z.string().url("Must be a valid URL").or(z.literal('')),
  })).optional(),
  videos: z.array(z.object({
    url: z.string().url("Must be a valid URL").or(z.literal('')),
  })).optional(),
  giftWithPurchase: z.object({
    enabled: z.boolean().default(false),
    description: z.string().optional(),
  }).optional(),
  preOrder: z.object({
    enabled: z.boolean().default(false),
    releaseDate: z.date().optional().nullable(),
    depositType: z.enum(['percentage', 'fixed']).optional().nullable(),
    depositAmount: z.coerce.number().optional().nullable(),
    limit: z.coerce.number().int().optional().nullable(),
  }).optional(),
  flashSale: z.object({
    enabled: z.boolean().default(false),
    endDate: z.date().optional().nullable(),
  }).optional(),
});


const getVariantsAsArray = (variants: any): ProductVariant[] => {
    if (Array.isArray(variants)) {
      return variants;
    }
    if (typeof variants === 'object' && variants !== null) {
      return Object.values(variants);
    }
    return [];
};

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const { data: allProducts, isLoading: isLoadingProducts } = useFirestoreQuery<Product>('products');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

   const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" });
   const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control: form.control, name: "specifications" });
   const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: form.control, name: "gallery" });
   const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({ control: form.control, name: "videos" });


  useEffect(() => {
    if (!product) return;
    const releaseDate = product.preOrder?.releaseDate;
    const releaseDateObj = releaseDate 
        ? typeof releaseDate === 'string' ? new Date(releaseDate) : releaseDate?.toDate() 
        : undefined;
    
    const flashSaleEndDate = product.flashSale?.endDate;
    const flashSaleEndDateObj = flashSaleEndDate
        ? typeof flashSaleEndDate === 'string' ? new Date(flashSaleEndDate) : flashSaleEndDate?.toDate()
        : undefined;

    form.reset({
      name: product.name || '',
      keywords: '',
      description: product.description || '',
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice ?? 0,
      baseSku: product.baseSku || '',
      brand: product.brand || '',
      image: product.image || '',
      category: product.category || '',
      group: product.group || '',
      subcategory: product.subcategory || '',
      variantSizes: product.sizes?.join(', ') || '',
      variantColors: product.colors?.join(', ') || '',
      variants: getVariantsAsArray(product.variants).map(v => ({
        ...v,
        compareAtPrice: v.compareAtPrice ?? 0,
      })),
      specifications: product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : [],
      gallery: product.gallery ? product.gallery.map(url => ({ url })) : [],
      videos: product.videos ? product.videos.map(url => ({ url })) : [],
      giftWithPurchase: product.giftWithPurchase || { enabled: false, description: '' },
      preOrder: {
          enabled: product.preOrder?.enabled || false,
          releaseDate: releaseDateObj || null,
          depositType: product.preOrder?.depositType ?? undefined,
          depositAmount: product.preOrder?.depositAmount,
          limit: product.preOrder?.limit,
      },
      flashSale: {
          enabled: product.flashSale?.enabled || false,
          endDate: flashSaleEndDateObj || null,
      },
    });
  }, [product, form]);

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
  
  const handleGenerateDescription = async () => {
    const { name, category, keywords } = form.getValues();
    if (!name || !category) {
        toast({
            variant: "destructive",
            title: "Name and Category Required",
            description: "Please enter a product name and select a category before generating a description.",
        });
        return;
    }
    setIsGeneratingDesc(true);
    try {
        const result = await generateProductDescription({
            name,
            category,
            keywords: keywords || '',
        });
        if (result.description) {
            form.setValue('description', result.description, { shouldValidate: true });
            toast({ title: "Description generated successfully!" });
        } else {
            throw new Error("AI returned an empty description.");
        }
    } catch (error) {
        console.error("Error generating description:", error);
        toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate description. Please try again." });
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleGenerateVariants = () => {
    const { variantColors, variantSizes, baseSku, price, compareAtPrice } = form.getValues();
    const colors = variantColors?.split(',').map(c => c.trim()).filter(Boolean) || [];
    const sizes = variantSizes?.split(',').map(s => s.trim()).filter(Boolean) || [];
    
    remove();
    
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
        append({ sku: `${baseSku}-${size.toUpperCase()}`, color: '', size, image: '', stock: 0, price, compareAtPrice: newCompareAtPrice });
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
    if (!firestore || !product) return;
    setIsLoading(true);
    try {
      const productRef = doc(firestore, 'products', product.id);
      
      const { price, compareAtPrice } = values;
      let discount = 0;
      if (compareAtPrice && compareAtPrice > price) {
          discount = ((compareAtPrice - price) / compareAtPrice) * 100;
      }
      
      const originalVariantsArray = getVariantsAsArray(product.variants);
      const updatedVariants = values.variants.map(formVariant => {
          const originalVariant = originalVariantsArray.find(v => v.sku === formVariant.sku);
          return {
              ...formVariant,
              stock: Number(originalVariant?.stock || 0),
              outlet_stocks: originalVariant ? (originalVariant.outlet_stocks || {}) : {}
          };
      });

      const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

      const dataToUpdate: any = {
        name: values.name,
        description: values.description,
        category: values.category,
        group: values.group,
        subcategory: values.subcategory,
        price: values.price,
        compareAtPrice: values.compareAtPrice ?? null,
        baseSku: values.baseSku,
        brand: values.brand,
        image: values.image,
        sizes: values.variantSizes ? values.variantSizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: values.variantColors ? values.variantColors.split(',').map(c => c.trim()).filter(Boolean) : [],
        specifications: values.specifications ? values.specifications.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {} as { [key: string]: string }) : {},
        gallery: values.gallery ? values.gallery.map(item => item.url).filter(Boolean) : [],
        videos: values.videos ? values.videos.map(item => item.url).filter(Boolean) : [],
        discount: Math.round(discount),
        variants: updatedVariants,
        total_stock: totalStock,
      };

      if (values.giftWithPurchase?.enabled) {
        dataToUpdate.giftWithPurchase = {
            enabled: true,
            description: values.giftWithPurchase.description || "",
        };
      } else {
          dataToUpdate.giftWithPurchase = {
              enabled: false,
              description: "",
          };
      }
  
      if (values.preOrder?.enabled) {
          dataToUpdate.preOrder = {
              enabled: true,
              releaseDate: values.preOrder.releaseDate || null,
              depositType: values.preOrder.depositType || null,
              depositAmount: values.preOrder.depositAmount || null,
              limit: values.preOrder.limit || null,
          };
      } else {
          dataToUpdate.preOrder = {
              enabled: false,
              releaseDate: null,
              depositType: null,
              depositAmount: null,
              limit: null,
          };
      }
  
      if (values.flashSale?.enabled) {
          dataToUpdate.flashSale = {
              enabled: true,
              endDate: values.flashSale.endDate || null,
          };
      } else {
          dataToUpdate.flashSale = {
              enabled: false,
              endDate: null,
          };
      }

      await updateDoc(productRef, dataToUpdate);

      toast({
        title: "Product Updated!",
        description: `${values.name} has been successfully updated.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not update the product. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for this product. Stock is managed via logistics.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
             <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Classic Cotton T-Shirt" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="keywords" render={({ field }) => (
                <FormItem>
                    <FormLabel>Keywords for AI</FormLabel>
                    <FormControl><Input placeholder="e.g., lightweight, breathable, summer wear" {...field} /></FormControl>
                    <FormDescription>Provide keywords to help the AI generate a better description.</FormDescription>
                    <FormMessage />
                </FormItem>
             )} />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description</FormLabel>
                    <div className="relative">
                    <FormControl><Textarea placeholder="Describe the product..." {...field} rows={6} /></FormControl>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 flex items-center gap-1.5"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDesc}
                    >
                        {isGeneratingDesc ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />}
                        <span>Generate</span>
                    </Button>
                    </div>
                    <FormMessage />
                </FormItem>
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
                <FormField control={form.control} name="compareAtPrice" render={({ field }) => (<FormItem><FormLabel>Base Compare-at Price (MRP ৳)</FormLabel><FormControl><Input type="number" placeholder="1299" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
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
                        <TableCell>{form.getValues(`variants.${index}.color`) || 'N/A'}</TableCell>
                        <TableCell>{form.getValues(`variants.${index}.size`) || 'N/A'}</TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.sku`} render={({ field }) => (<Input {...field} />)} /></TableCell>
                        <TableCell><FormField control={form.control} name={`variants.${index}.image`} render={({ field }) => (<Input placeholder="https://..." {...field} />)} /></TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                readOnly
                                disabled
                                className="bg-muted cursor-not-allowed"
                              />
                            )}
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
             
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="specifications">
                <AccordionTrigger>Additional Specifications</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {specFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2">
                        <FormField control={form.control} name={`specifications.${index}.key`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Key</FormLabel><FormControl><Input placeholder="e.g., Material" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`specifications.${index}.value`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Value</FormLabel><FormControl><Input placeholder="e.g., Cotton" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: '', value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Specification</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="gallery">
                <AccordionTrigger>Image Gallery</AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4">
                    {galleryFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2">
                        <FormField control={form.control} name={`gallery.${index}.url`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGallery(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ url: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Image</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="videos">
                <AccordionTrigger>Videos</AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4">
                    {videoFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2">
                        <FormField control={form.control} name={`videos.${index}.url`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>YouTube Embed URL</FormLabel><FormControl><Input placeholder="https://www.youtube.com/embed/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeVideo(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendVideo({ url: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Video</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
                          <Input placeholder="e.g., Free leather wallet" {...field} value={field.value ?? ''} />
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
                                  <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
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
                                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
                                  <FormItem><FormLabel>Deposit Amount</FormLabel><FormControl><Input type="number" placeholder="e.g., 20 or 500" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                              )}
                          />
                      </div>
                       <FormField
                          control={form.control}
                          name="preOrder.limit"
                          render={({ field }) => (
                              <FormItem><FormLabel>Pre-order Limit</FormLabel><FormControl><Input type="number" placeholder="Max pre-orders" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
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
                                  <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                              </Popover>
                              <FormMessage /></FormItem>
                      )} />
                  </div>
                )}
            </div>

            <DialogFooter className="pt-8">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
