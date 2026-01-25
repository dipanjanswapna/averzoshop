
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/providers';
import { Moon, Sun, Image as ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function ArtisanSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, userData, firestore, auth } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [coverPhotoURL, setCoverPhotoURL] = useState(userData?.coverPhotoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
    if (user?.photoURL) setPhotoURL(user.photoURL);
    if (userData) {
        setPhone(userData.phone || '');
        setBio(userData.bio || '');
        setCoverPhotoURL(userData.coverPhotoURL || '');
    }
  }, [user, userData]);

  const handleSave = async () => {
    if (!user || !auth || !firestore || !name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save changes.' });
      return;
    }

    setIsSaving(true);
    try {
      const authUpdates: { displayName?: string, photoURL?: string } = {};
      if (name !== user.displayName) authUpdates.displayName = name;
      if (photoURL !== user.photoURL) authUpdates.photoURL = photoURL;
      
      const firestoreUpdates: any = { displayName: name };
      if (phone !== userData?.phone) firestoreUpdates.phone = phone;
      if (bio !== userData?.bio) firestoreUpdates.bio = bio;
      if (coverPhotoURL !== userData?.coverPhotoURL) firestoreUpdates.coverPhotoURL = coverPhotoURL;
      if (photoURL !== user.photoURL) firestoreUpdates.photoURL = photoURL;


      if (Object.keys(authUpdates).length > 0 && auth.currentUser) {
        await updateProfile(auth.currentUser, authUpdates);
      }

      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, firestoreUpdates);

      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Artisan Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>This information will be displayed on your public artisan storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoURL || ''} alt={name || ''} />
              <AvatarFallback>{name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
             <div className="flex-1 space-y-2">
                <Label htmlFor="photoUrl">Profile Picture URL</Label>
                <Input id="photoUrl" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://example.com/profile.jpg" />
            </div>
          </div>
          
           <div className="space-y-2">
              <Label htmlFor="coverPhotoUrl">Cover Photo URL</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {coverPhotoURL ? <img src={coverPhotoURL} alt="Cover preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
                </div>
                <Input id="coverPhotoUrl" value={coverPhotoURL} onChange={(e) => setCoverPhotoURL(e.target.value)} placeholder="https://example.com/cover.jpg" className="flex-1" />
              </div>
           </div>
           
           <div className="space-y-2">
             <Label htmlFor="bio">Short Bio</Label>
             <Textarea id="bio" placeholder="Tell customers about yourself and your craft..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name / Business Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input id="phone" type="tel" placeholder="Your contact number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Public Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={userData?.role || 'artisan'} disabled className="capitalize" />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun size={16} /> Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon size={16} /> Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
