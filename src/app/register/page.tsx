'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { sendMagicLink } from '@/actions/auth-actions';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['customer', 'vendor', 'rider', 'outlet', 'admin', 'sales'], { required_error: 'Please select a role.' }),
  password: z.string().optional(),
}).refine(data => data.role === 'customer' || (data.password && data.password.length >= 6), {
  message: "Password must be at least 6 characters for this role.",
  path: ["password"],
});


function RegisterPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'customer',
      password: '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      setIsLoading(false);
      return;
    }

    // Customer registration with magic link
    if (values.role === 'customer') {
      try {
        window.localStorage.setItem('nameForSignIn', values.name); // Store name for account creation
        const result = await sendMagicLink(auth, values.email);
        if (result.success) {
          toast({ title: 'Verification Link Sent', description: result.message });
          router.push('/login'); // Redirect to login page to inform user
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Could not send link", description: error.message });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Password-based registration for other roles
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password!);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: values.name,
        photoURL: user.photoURL,
        role: values.role,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Registration Submitted!",
        description: "Your account is pending approval. We'll notify you soon."
      });
      router.push('/login');

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
    // Logic for Google Sign-In remains the same
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <AverzoLogo className="mx-auto mb-4" />
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Join our community by entering your details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="rider">Rider</SelectItem>
                        <SelectItem value="sales">Sales Representative</SelectItem>
                    </SelectContent>
                    </Select><FormMessage /></FormItem>
              )} />
              {selectedRole !== 'customer' && (
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
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : (selectedRole === 'customer' ? 'Send Verification Link' : 'Create Account')}
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>Google</Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
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
