'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, FirebaseClientProvider } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PageStatus = 'verifying' | 'form' | 'signing_in' | 'error';

function VerifyEmailContent() {
    const { auth, firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    
    const [status, setStatus] = useState<PageStatus>('verifying');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { password: '', confirmPassword: '' },
    });

    useEffect(() => {
        const handleVerification = async () => {
            if (!auth || !firestore) return;

            const href = window.location.href;
            if (!isSignInWithEmailLink(auth, href)) {
                setErrorMessage('This is not a valid sign-in link. It may have expired or been used already.');
                setStatus('error');
                return;
            }
            
            const storedEmail = window.localStorage.getItem('emailForSignIn');
            if (!storedEmail) {
                setErrorMessage('Could not verify email. Your session might have expired. Please try again.');
                setStatus('error');
                return;
            }
            setEmail(storedEmail);

            const isNewUser = !!window.localStorage.getItem('nameForSignIn');

            if (isNewUser) {
                // It's a new registration, show password form
                setStatus('form');
            } else {
                // It's an existing user logging in
                setStatus('signing_in');
                try {
                    await signInWithEmailLink(auth, storedEmail, href);
                    window.localStorage.removeItem('emailForSignIn');
                    toast({ title: "Login Successful", description: "Welcome back!" });
                    router.replace('/'); // Redirect to home, protected layout will handle the rest.
                } catch (err: any) {
                    setErrorMessage('Failed to sign in. The link may have expired.');
                    setStatus('error');
                }
            }
        };

        handleVerification();
    }, [auth, firestore, router, toast]);

    const onSubmitPassword = async (values: z.infer<typeof formSchema>) => {
        if (!auth || !firestore || !email) {
            toast({ variant: 'destructive', title: 'An error occurred. Please try again.' });
            return;
        }
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailLink(auth, email, window.location.href);
            const user = userCredential.user;
            await updatePassword(user, values.password);
            
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const name = window.localStorage.getItem('nameForSignIn');
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: name || user.displayName || 'New User',
                    photoURL: user.photoURL,
                    role: 'customer',
                    status: 'approved',
                    createdAt: serverTimestamp(),
                    loyaltyPoints: 100,
                    totalSpent: 0,
                    membershipTier: 'silver',
                    addresses: [], // Initialize with empty addresses
                    wishlist: []
                });
                toast({ title: 'Welcome!', description: "Your account is created and you've received 100 bonus points!" });
            } else {
                toast({ title: 'Password Set!', description: 'Your password has been successfully set.' });
            }

            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('nameForSignIn');
            
            router.replace('/permissions');

        } catch (err: any) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Setup Failed', description: 'Could not set up your account. The link may have expired.' });
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
            case 'signing_in':
                return (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">{status === 'verifying' ? 'Verifying link...' : 'Signing you in...'}</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center py-4">
                        <p className="text-destructive">{errorMessage}</p>
                        <Button onClick={() => router.replace('/login')} className="mt-4">
                            Back to Login
                        </Button>
                    </div>
                );
            case 'form':
                return (
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Setting Up...' : 'Set Password & Login'}
                            </Button>
                        </form>
                    </Form>
                );
        }
    }
    
    const getTitle = () => {
         switch (status) {
            case 'verifying': return 'Verifying Link...';
            case 'signing_in': return 'Signing In...';
            case 'error': return 'An Error Occurred';
            case 'form': return 'Complete Your Registration';
        }
    }
    
    const getDescription = () => {
         if (status === 'form') {
             return 'Your email is verified! Now, set a password for your account.';
         }
         return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <AverzoLogo className="mx-auto mb-4" />
                    <CardTitle>{getTitle()}</CardTitle>
                    {getDescription() && <CardDescription>{getDescription()}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
      <FirebaseClientProvider>
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
      </FirebaseClientProvider>
    )
}
