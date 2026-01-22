
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { useAuth } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase';
import { sendSignInLink } from '@/actions/auth-actions';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const passwordlessSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false);
  const { auth, firestore, user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const passwordlessForm = useForm<z.infer<typeof passwordlessSchema>>({
    resolver: zodResolver(passwordlessSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user && userData) {
      // For customers, check if permissions need to be set
      if (userData.role === 'customer' && (!userData.addresses || userData.addresses.length === 0)) {
        router.replace('/permissions');
        return;
      }

      // Handle specific redirects (e.g., from trying to access a protected page)
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
          router.replace(redirectUrl);
          return;
      }
      
      // Default role-based redirection
      const roleRedirects = {
        admin: '/dashboard',
        customer: '/', // Customers go to the homepage
        vendor: '/vendor/dashboard',
        outlet: '/outlet/dashboard',
        rider: '/rider/dashboard',
        sales: '/sales/dashboard',
      };
      
      router.replace(roleRedirects[userData.role] || '/');
    }
  }, [user, userData, authLoading, router, searchParams]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    if (!auth) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Login Successful', description: 'Redirecting...' });
      // The useEffect will handle the redirection.
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordlessSubmit = async (values: z.infer<typeof passwordlessSchema>) => {
    setLoading(true);
    try {
      window.localStorage.setItem('emailForSignIn', values.email);
      const result = await sendSignInLink({ email: values.email });
      if (result.success) {
        toast({ title: 'Check your email', description: 'A sign-in link has been sent to your email address.' });
        setIsPasswordless(false); // Switch back to password form
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Failed to send link', description: error.message });
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'customer',
          status: 'approved',
          createdAt: serverTimestamp(),
          loyaltyPoints: 100,
          totalSpent: 0,
          membershipTier: 'silver',
        });
        toast({ title: 'Welcome!', description: "Your account is created and you've received 100 bonus points!" });
      } else {
        await setDoc(userDocRef, {
          displayName: user.displayName,
          photoURL: user.photoURL,
        }, { merge: true });
        toast({ title: 'Google Sign-In Successful', description: 'Welcome back!' });
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
    }
  };
  
  if (authLoading || (user && userData)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="lds-ring"><div /><div /><div /><div /></div>
            <AverzoLogo className="text-xl" />
            <p className="text-muted-foreground animate-pulse">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <AverzoLogo className="mx-auto mb-4" />
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPasswordless ? (
            <Form {...passwordlessForm}>
              <form onSubmit={passwordlessForm.handleSubmit(handlePasswordlessSubmit)} className="space-y-4">
                <FormField
                  control={passwordlessForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Sign-in Link'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
                      </div>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </Form>
          )}

           <div className="text-center mt-4">
              <Button variant="link" onClick={() => setIsPasswordless(!isPasswordless)} className="text-sm">
                 {isPasswordless ? 'Sign in with password instead' : 'Sign in with email link'}
              </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>Google</Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <LoginPageContent />
    </FirebaseClientProvider>
  )
}
