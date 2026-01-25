'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { motion } from 'framer-motion';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['customer', 'vendor', 'rider', 'outlet', 'admin', 'sales', 'artisan'], { required_error: 'Please select a role.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

interface RegistrationSettings {
  vendor: boolean;
  rider: boolean;
  sales: boolean;
  artisan: boolean;
}

function RegisterPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const { data: regSettings, isLoading: settingsLoading } = useFirestoreDoc<RegistrationSettings>('settings/registration');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'customer',
      password: '',
    },
  });

  const availableRoles = useMemo(() => {
    const roles = [{ value: 'customer', label: 'Customer' }];
    if (regSettings?.vendor) roles.push({ value: 'vendor', label: 'Vendor (with outlets)' });
    if (regSettings?.artisan) roles.push({ value: 'artisan', label: 'Artisan / Home Business' });
    if (regSettings?.rider) roles.push({ value: 'rider', label: 'Rider' });
    if (regSettings?.sales) roles.push({ value: 'sales', label: 'Sales Representative' });
    return roles;
  }, [regSettings]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password!);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });
      
      const isCustomer = values.role === 'customer';
      const status = isCustomer ? 'approved' : 'pending';

      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName: values.name,
        photoURL: user.photoURL,
        role: values.role,
        status: status,
        createdAt: serverTimestamp(),
      };
      
      if (isCustomer) {
        userData.loyaltyPoints = 100;
        userData.totalSpent = 0;
        userData.membershipTier = 'silver';
      }

      await setDoc(doc(firestore, "users", user.uid), userData);
      
      if (isCustomer) {
          toast({
            title: "Welcome!",
            description: "Your account is created. Let's get you set up."
          });
          router.push('/onboarding'); // Go to onboarding setup
      } else {
         toast({
            title: "Registration Submitted!",
            description: "Your account is pending approval. We'll notify you soon."
          });
         router.push('/login');
      }

    } catch (error: any) {
      let description = "Could not create your account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
          description = 'This email is already registered. Please log in.';
      }
      toast({ variant: "destructive", title: "Registration Failed", description });
    } finally {
        setIsLoading(false);
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
        toast({ title: 'Welcome!', description: "Your account is created. Let's get you set up." });
        router.push('/onboarding');
      } else {
        await setDoc(userDocRef, {
          displayName: user.displayName,
          photoURL: user.photoURL,
        }, { merge: true });
        toast({ title: 'Google Sign-In Successful', description: 'Welcome back!' });
         router.push('/');
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
       <div className="relative hidden lg:block">
        <Image 
            src="https://i.postimg.cc/GpZKNMRz/jon_ly_Xn7Gvim_Qrk8_unsplash.jpg"
            alt="Person working on crafts"
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
                    Join the Movement.
                </h1>
                <p className="mt-4 text-lg max-w-lg text-white/80">
                    Become a part of our vibrant community of creators, sellers, and shoppers. Your next masterpiece starts here.
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
            <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Join our community by entering your details below.
            </p>
          </motion.div>
          <Form {...form}>
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"
            >
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Register as</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select><FormMessage /></FormItem>
              )} />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <Button type="submit" className="w-full h-11" disabled={isLoading || settingsLoading}>
                {isLoading || settingsLoading ? 'Processing...' : 'Create Account'}
              </Button>
            </motion.form>
          </Form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>Google</Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
    return (
        <FirebaseClientProvider>
            <RegisterPageContent />
        </FirebaseClientProvider>
    )
}
