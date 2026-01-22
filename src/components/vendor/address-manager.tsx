'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddressCard } from './address-card';
import { AddressDialog } from './address-dialog';
import type { Address } from '@/types/address';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AddressManager() {
  const { userData, user, firestore } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const handleAddNew = () => {
    setAddressToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setAddressToEdit(address);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (addressData: Omit<Address, 'id'>, id?: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in' });
      return;
    }
    setIsLoading(true);
    const userRef = doc(firestore, 'users', user.uid);
    const currentAddresses = userData?.addresses || [];
    let updatedAddresses: Address[];

    if (id) { // Editing existing address
        updatedAddresses = currentAddresses.map(addr => addr.id === id ? { ...addr, ...addressData, id } : addr);
    } else { // Adding new address
        const newAddress: Address = { ...addressData, id: Date.now().toString() };
        updatedAddresses = [...currentAddresses, newAddress];
    }
    
    try {
        await updateDoc(userRef, { addresses: updatedAddresses });
        toast({ title: `Address ${id ? 'updated' : 'saved'} successfully!` });
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to save address', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async () => {
     if (!addressToDelete || !user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'No address selected for deletion.' });
      return;
    }

    setIsLoading(true);
    const userRef = doc(firestore, 'users', user.uid);
    const currentAddresses = userData?.addresses || [];
    const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressToDelete.id);
     try {
        await updateDoc(userRef, { addresses: updatedAddresses });
        toast({ title: 'Address deleted' });
        setIsDeleteDialogOpen(false);
        setAddressToDelete(null);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete address', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Business Addresses</CardTitle>
                <CardDescription>Manage your business locations.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Address
            </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData?.addresses && userData.addresses.length > 0 ? (
                userData.addresses.map(address => (
                    <AddressCard 
                        key={address.id} 
                        address={address} 
                        onEdit={() => handleEdit(address)} 
                        onDelete={() => handleDeleteConfirmation(address)}
                    />
                ))
            ) : (
                <div className="md:col-span-2 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                    <p>You haven't saved any business addresses yet.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        addressToEdit={addressToEdit}
        isLoading={isLoading}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the address: <span className="font-bold">{addressToDelete?.streetAddress}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className={buttonVariants({ variant: "destructive" })}>
                {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
