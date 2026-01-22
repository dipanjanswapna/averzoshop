'use client';

import { useEffect, useState } from 'react';
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
import { Address } from '@/types/address';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

const InteractiveMap = dynamic(() => import('@/components/ui/interactive-map'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-[300px] rounded-lg" />
});


interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (address: Omit<Address, 'id'>, id?: string) => void;
  addressToEdit?: Address | null;
  isLoading: boolean;
}

const formSchema = z.object({
  label: z.enum(['Home', 'Office', 'Other'], { required_error: 'Please select a label.' }),
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().min(11, 'A valid phone number is required.'),
  district: z.string().min(1, 'District is required.'),
  area: z.string().min(1, 'Area/Post Office is required.'),
  streetAddress: z.string().min(1, 'Street address is required.'),
  coordinates: z.object({
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
  }).optional(),
});

export function AddressDialog({ open, onOpenChange, onSave, addressToEdit, isLoading }: AddressDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: 'Home',
      name: '',
      phone: '',
      district: 'Dhaka',
      area: '',
      streetAddress: '',
      coordinates: { lat: 23.8103, lng: 90.4125 },
    },
  });

  useEffect(() => {
    if (addressToEdit) {
      form.reset({
        ...addressToEdit,
        coordinates: {
            lat: addressToEdit.coordinates?.lat || 23.8103,
            lng: addressToEdit.coordinates?.lng || 90.4125,
        }
      });
    } else {
      form.reset({
        label: 'Home', name: '', phone: '', district: 'Dhaka',
        area: '', streetAddress: '', coordinates: { lat: 23.8103, lng: 90.4125 },
      });
    }
  }, [addressToEdit, form, open]); // Added `open` dependency to reset form when dialog opens

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values, addressToEdit?.id);
  };
  
  const handleLocationSelect = (details: { lat: number; lng: number; district: string; area: string; streetAddress: string; }) => {
    form.setValue('coordinates', {lat: details.lat, lng: details.lng}, { shouldValidate: true });
    form.setValue('district', details.district, { shouldValidate: true });
    form.setValue('area', details.area, { shouldValidate: true });
    form.setValue('streetAddress', details.streetAddress, { shouldValidate: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{addressToEdit ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            Enter your delivery address details here. You can use the interactive map to pinpoint your location.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto px-1">
            
            <div className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Enter your phone" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <FormField control={form.control} name="label" render={({ field }) => (
                    <FormItem><FormLabel>Address Label</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a label" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Home">Home</SelectItem><SelectItem value="Office">Office</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                  )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <FormField control={form.control} name="district" render={({ field }) => (
                        <FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="e.g., Dhaka" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area" render={({ field }) => (
                        <FormItem><FormLabel>Area / Post Office</FormLabel><FormControl><Input placeholder="e.g., Banani" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="streetAddress" render={({ field }) => (
                    <FormItem><FormLabel>Street Address / House No.</FormLabel><FormControl><Input placeholder="e.g., House 123, Road 45" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="coordinates.lat" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (Auto)</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="Auto-filled from map" {...field} readOnly /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="coordinates.lng" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (Auto)</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="Auto-filled from map" {...field} readOnly /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
            </div>

            <div className="flex flex-col">
              {open && (
                  <InteractiveMap 
                    onLocationSelect={handleLocationSelect} 
                    initialPosition={[form.getValues('coordinates.lat') || 23.8103, form.getValues('coordinates.lng') || 90.4125]} 
                  />
              )}
            </div>
             <div className="md:col-span-2">
                <DialogFooter className="pt-4">
                    <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Address'}</Button>
                </DialogFooter>
             </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
