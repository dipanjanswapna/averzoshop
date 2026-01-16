'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, FirebaseClientProvider } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AverzoLogo from '@/components/averzo-logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Zod schema for the password form
const passwordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function VerifyEmailPageContent() {
    const { auth, firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState('Verifying your email...');
    const [step, setStep] = useState<'verifying' | 'setPassword' | 'error'>('verifying');
    const [userCredential, setUserCredential] = useState<any>(null); // To store the user credential after email link sign-in

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    useEffect(() => {
        const completeSignIn = async () => {
            if (!auth || !firestore) {
                return; // Wait for firebase to initialize
            }

            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                
                if (!email) {
                    email = window.prompt('Please provide your email for confirmation');
                }

                if (!email) {
                    setStatus('Could not find your email. Please try registering again.');
                    setStep('error');
                    return;
                }

                try {
                    const result = await signInWithEmailLink(auth, email, window.location.href);
                    setUserCredential(result);
                    setStatus('Email verified. Please set your password.');
                    setStep('setPassword');
                } catch (error: any) {
                    console.error("Verification Error:", error);
                    setStatus(`Verification Failed: The link may be expired or invalid.`);
                    setStep('error');
                    toast({ variant: 'destructive', title: 'Verification Failed', description: 'The link may be expired or invalid. Please try again.' });
                }
            } else {
                setStatus('Invalid verification link. Please try registering again.');
                setStep('error');
            }
        };

        completeSignIn();
    }, [auth, firestore, toast]);

    const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        if (!userCredential || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Session expired. Please try again.' });
            setStep('error');
            return;
        }

        setStatus('Creating your account...');
        const user = userCredential.user;

        try {
            // 1. Set the password for the new user
            await updatePassword(user, values.password);

            // 2. Create the user document in Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const detailsString = window.localStorage.getItem('registrationDetails');
                const registrationDetails = detailsString ? JSON.parse(detailsString) : { name: user.email?.split('@')[0] || 'New User', role: 'customer' };

                if (registrationDetails.name) {
                  await updateProfile(user, { displayName: registrationDetails.name });
                }

                const status = registrationDetails.role === 'customer' ? 'approved' : 'pending';

                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: registrationDetails.name,
                    photoURL: user.photoURL,
                    role: registrationDetails.role,
                    status: status,
                    createdAt: serverTimestamp(),
                    loyaltyPoints: 100,
                    totalSpent: 0,
                    membershipTier: 'silver',
                });
                toast({ title: "Welcome!", description: "Your account is created. You've been awarded 100 bonus points!" });
            }

            // 3. Clean up and redirect
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('registrationDetails');
            
            setStatus('All set! Redirecting...');
            router.push('/dashboard');

        } catch (error: any) {
            console.error(error);
            setStatus(`Account creation failed: ${error.message}`);
            setStep('error');
            toast({ variant: 'destructive', title: 'Account Creation Failed', description: 'Could not set your password. Please try again.' });
        }
    };


    if (step === 'verifying' || step === 'error') {
      return (
          <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
              <AverzoLogo />
              <div className="flex items-center gap-2 text-muted-foreground">
                  {step === 'verifying' && <Loader2 className="animate-spin" />}
                  <p className="font-medium">{status}</p>
              </div>
              {step === 'error' && <Button onClick={() => router.push('/register')}>Go to Registration</Button>}
          </div>
      );
    }
    
    if (step === 'setPassword') {
       return (
            <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                    <AverzoLogo className="mx-auto mb-4" />
                    <CardTitle>Set Your Password</CardTitle>
                    <CardDescription>Your email has been verified. Create a secure password to complete your registration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Complete Registration'}
                        </Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </div>
       )
    }

    return null;
}

export default function VerifyEmailPage() {
    return (
        <FirebaseClientProvider>
            <VerifyEmailPageContent />
        </FirebaseClientProvider>
    );
}
