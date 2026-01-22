'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword, updateProfile, type UserCredential } from 'firebase/auth';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const { toast } = useToast();
    const [status, setStatus] = useState('Verifying your email...');
    const [step, setStep] = useState<'verifying' | 'setPassword' | 'error' | 'promptEmail'>('verifying');
    const [userCredential, setUserCredential] = useState<UserCredential | null>(null);
    const [emailForVerification, setEmailForVerification] = useState('');

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });
    
    const processSignIn = async (email: string) => {
        if (!auth) return;
        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            setUserCredential(result);
            setStatus('Email verified. Please set your password.');
            setStep('setPassword');
             window.localStorage.removeItem('emailForSignIn');
        } catch (error: any) {
            console.error("Verification Error:", error);
            setStatus(`Verification Failed: The link may be expired or invalid.`);
            setStep('error');
            toast({ variant: 'destructive', title: 'Verification Failed', description: 'The link may be expired or invalid. Please try again.' });
        }
    };


    useEffect(() => {
        const completeSignIn = async () => {
            if (!auth || !firestore) {
                return;
            }

            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                
                if (!email) {
                    setStep('promptEmail');
                } else {
                    await processSignIn(email);
                }

            } else {
                setStatus('Invalid verification link. Please try registering again.');
                setStep('error');
            }
        };

        if(auth && firestore) {
          completeSignIn();
        }
    }, [auth, firestore]);

    const handleEmailPromptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (emailForVerification) {
            setStep('verifying');
            await processSignIn(emailForVerification);
        } else {
            toast({ variant: 'destructive', title: 'Email required', description: 'Please enter your email address.' });
        }
    };

    const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        if (!userCredential || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Session expired. Please try again.' });
            setStep('error');
            return;
        }

        setStatus('Creating your account...');
        const user = userCredential.user;

        try {
            await updatePassword(user, values.password);

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

            window.localStorage.removeItem('registrationDetails');
            
            setStatus('All set! Redirecting...');
            router.push('/permissions');

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

     if (step === 'promptEmail') {
        return (
             <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
                <Dialog open={true} onOpenChange={() => setStep('error')}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Your Email</DialogTitle>
                            <DialogDescription>
                                To complete verification, please provide the email address where you received the link.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEmailPromptSubmit}>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="email-prompt">Email Address</Label>
                                <Input
                                    id="email-prompt"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={emailForVerification}
                                    onChange={(e) => setEmailForVerification(e.target.value)}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Confirm Email</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Background content */}
                 <AverzoLogo />
                <div className="flex items-center gap-2 text-muted-foreground">
                    <p className="font-medium">Waiting for email confirmation...</p>
                </div>
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
