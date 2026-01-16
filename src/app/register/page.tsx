'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendSignInLinkToEmail, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['customer', 'vendor', 'rider'], { required_error: 'Please select a role.' }),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
    if ((data.role === 'vendor' || data.role === 'rider') && (!data.password || data.password.length < 6)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must be at least 6 characters.',
            path: ['password'],
        });
    }
});


function RegisterPageContent() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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

  const handleEmailPasswordRegistration = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password!);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: values.name,
        photoURL: user.photoURL,
        role: values.role,
        status: 'pending', // Vendors and Riders require approval
        createdAt: serverTimestamp(),
        loyaltyPoints: 0,
        totalSpent: 0,
        membershipTier: 'silver',
      });
      
      toast({
        title: "Registration Submitted!",
        description: "Your account is pending approval. We'll notify you soon."
      });

      router.push('/login');

    } catch (error: any) {
      console.error("Error creating account:", error);
      let description = "Could not create your account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
          description = 'This email is already registered. Please log in.';
      }
      toast({ variant: "destructive", title: "Registration Failed", description });
    } finally {
        setLoading(false);
    }
  };


  const handleSendLink = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    if (!auth) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      setLoading(false);
      return;
    }
    
    const actionCodeSettings = {
      url: `${window.location.origin}/verify-email`, // New page to handle verification
      handleCodeInApp: true,
    };

    try {
        const registrationDetails = { name: values.name, role: values.role };
        window.localStorage.setItem('registrationDetails', JSON.stringify(registrationDetails));
        window.localStorage.setItem('emailForSignIn', values.email);

        await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);

        setEmailSent(true);
    } catch (error: any) {
        console.error("Error sending email link:", error);
        toast({ variant: "destructive", title: "Failed to send link", description: "Please try again later." });
    } finally {
        setLoading(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.role === 'customer') {
      await handleSendLink(values);
    } else {
      await handleEmailPasswordRegistration(values);
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
          loyaltyPoints: 100, // Bonus points for new sign-up
          totalSpent: 0,
          membershipTier: 'silver',
        });
        toast({ title: "Welcome!", description: "Your account is created and you've received 100 bonus points!" });
      } else {
        toast({ title: 'Google Sign-In Successful', description: 'Welcome back!' });
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        {emailSent ? (
          <CardContent className="pt-6 text-center">
            <AverzoLogo className="mx-auto mb-4" />
            <h2 className="text-xl font-bold">Check Your Email</h2>
            <p className="text-sm text-muted-foreground mt-2">
                A verification link has been sent to your email address. Please click the link to complete your registration.
            </p>
          </CardContent>
        ) : (
          <>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="rider">Rider</SelectItem>
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : (selectedRole === 'customer' ? 'Send Magic Link' : 'Create Account')}
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
          </>
        )}
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
