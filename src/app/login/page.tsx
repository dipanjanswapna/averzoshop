
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AverzoLogo from '@/components/averzo-logo';
import { useAuth } from '@/firebase/auth/use-auth.tsx';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, getFirestore, collection, query, limit, getDocs } from 'firebase/firestore';


export default function LoginPage() {
  const { auth, firestore, user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Automatic redirection is disabled. User will click "Go to Dashboard".
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
      console.error('Error signing in with email and password', error);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const usersCollectionRef = collection(firestore, 'users');
        const q = query(usersCollectionRef, limit(1));
        const querySnapshot = await getDocs(q);

        let role = 'customer';
        if (querySnapshot.empty) {
          role = 'admin';
        }

        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
        });
      }
      
      // Automatic redirection is disabled.
    } catch (error) {
      console.error('Error signing in with Google', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not sign in with Google. Please try again.',
      });
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleGoToDashboard = () => {
    if (userData?.role === 'customer') {
      router.replace('/customer');
    } else {
      router.replace('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center space-y-4">
            <AverzoLogo className="h-8 w-auto mx-auto" />
            <CardTitle className="text-2xl font-headline">
              Welcome, {user.displayName}
            </CardTitle>
            <CardDescription>You are already logged in.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button onClick={handleGoToDashboard} className="w-full">Go to Dashboard</Button>
            <Button variant="outline" onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
          <AverzoLogo className="h-8 w-auto mx-auto" />
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                  </span>
              </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={signInWithGoogle}
          >
            Login with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
