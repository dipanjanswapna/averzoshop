'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, FirebaseClientProvider } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
    const { auth, firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState('Verifying your email link...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyLink = async () => {
            if (!auth || !firestore || !window.localStorage) {
                setError('Could not initialize services. Please try again.');
                return;
            }

            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                let name = window.localStorage.getItem('nameForSignIn');

                if (!email) {
                    setError('Could not find email for sign-in. Please try the registration process again.');
                    return;
                }

                try {
                    const result = await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                    if (name) window.localStorage.removeItem('nameForSignIn');
                    
                    const user = result.user;
                    setStatus('Sign-in successful. Setting up your account...');

                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: name || user.displayName || 'New User',
                            photoURL: user.photoURL,
                            role: 'customer',
                            status: 'approved',
                            createdAt: serverTimestamp(),
                            loyaltyPoints: 100, // Welcome bonus
                            totalSpent: 0,
                            membershipTier: 'silver',
                        });
                        toast({ title: 'Welcome!', description: "Your account is created and you've received 100 bonus points!" });
                    } else {
                         toast({ title: 'Welcome Back!', description: 'You have successfully signed in.' });
                    }

                    setStatus('Redirecting to account setup...');
                    router.replace('/permissions');

                } catch (err: any) {
                    setError(`Failed to sign in. The link may be expired or invalid.`);
                    console.error(err);
                }

            } else {
                setError('This is not a valid sign-in link.');
            }
        };

        verifyLink();
    }, [auth, firestore, router, toast]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary text-center p-4">
            <AverzoLogo className="text-4xl mb-8" />
            <div className="bg-background p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold font-headline">{error ? 'Verification Failed' : 'Verifying Your Email'}</h1>
                <div className="flex items-center justify-center h-24">
                    {error ? (
                        <p className="text-destructive">{error}</p>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-6">
                            <div className="lds-ring">
                                <div /><div /><div /><div />
                            </div>
                            <p className="text-muted-foreground animate-pulse">{status}</p>
                        </div>
                    )}
                </div>
                 {error && (
                    <Button onClick={() => router.replace('/login')} className="mt-4">
                        Back to Login
                    </Button>
                )}
            </div>
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
