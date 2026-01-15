
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function CustomerProfilePage() {
    const { user, userData } = useAuth();
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal details and account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Photo</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={user?.displayName || ''} />
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
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    );
}
