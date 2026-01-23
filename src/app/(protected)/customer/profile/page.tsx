
'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddressManager } from '@/components/customer/address-manager';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function CustomerProfilePage() {
    const { user, userData, firestore, auth } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState(user?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSave = async () => {
        if (!user || !auth || !firestore || !name) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save changes.' });
            return;
        }
        
        setIsLoading(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name });
            }
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, { displayName: name });

            toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal details and account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="w-full flex-shrink-0 sm:w-auto">Change Photo</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" defaultValue={userData?.role || 'customer'} disabled className="capitalize" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AddressManager />
        </div>
    );
}
