'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { useAuth } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase';
import { motion } from 'framer-motion';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (!authLoading && user && userData) {
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
          router.replace(redirectUrl);
          return;
      }
      
      const roleRedirects: { [key: string]: string } = {
        admin: '/dashboard',
        vendor: '/vendor/dashboard',
        artisan: '/artisan/dashboard',
        outlet: '/outlet/dashboard',
        rider: '/rider/dashboard',
        sales: '/sales/dashboard',
        customer: '/', 
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
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
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
        router.push('/onboarding');
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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image 
            src="https://i.postimg.cc/PxH2GnKd/beautiful-young-woman-wearing-professional-makeup.jpg"
            alt="Fashion model"
            fill
            className="object-cover"
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h1 className="text-5xl font-extrabold font-headline leading-tight">
                    Style That Defines You.
                </h1>
                <p className="mt-4 text-lg max-w-lg text-white/80">
                    Discover a world of curated fashion and lifestyle products. Your next favorite look is just a click away.
                </p>
            </motion.div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-full max-w-sm gap-6">
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="grid gap-2 text-center"
           >
            <AverzoLogo className="text-4xl mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-headline">Welcome Back!</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </motion.div>
          <Form {...form}>
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"
            >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
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
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </motion.form>
            </Form>

             <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>Google</Button>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
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
