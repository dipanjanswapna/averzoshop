
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useFirebase, FirebaseClientProvider } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AverzoLogo from '@/components/averzo-logo';

function VerifyEmailPageContent() {
    const { auth, firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState('Verifying your email...');

    useEffect(() => {
        const verifyAndSignIn = async () => {
            if (!auth || !firestore || !window.localStorage) {
                setStatus('Error: Could not initialize services. Please try again.');
                return;
            }

            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    email = window.prompt('Please provide your email for confirmation');
                }
                if (!email) {
                    setStatus('Verification failed. Email not provided.');
                    toast({ variant: 'destructive', title: 'Email Required', description: 'Could not find email to complete sign-in.' });
                    router.push('/login');
                    return;
                }

                try {
                    const result = await signInWithEmailLink(auth, email, window.location.href);
                    setStatus('Sign-in successful! Setting up your account...');
                    
                    const user = result.user;
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
                            loyaltyPoints: 100, // 100 bonus points as requested
                            totalSpent: 0,
                            membershipTier: 'silver',
                        });
                         toast({ title: "Welcome!", description: "Your account is created. You've been awarded 100 bonus points!" });
                    }

                    window.localStorage.removeItem('emailForSignIn');
                    window.localStorage.removeItem('registrationDetails');
                    
                    setStatus('All set! Redirecting to your dashboard...');
                    router.push('/dashboard');
                } catch (error: any) {
                    console.error(error);
                    setStatus(`Verification Failed: ${error.message}`);
                    toast({ variant: 'destructive', title: 'Verification Failed', description: 'The link may be expired or invalid. Please try again.' });
                    router.push('/register');
                }
            } else {
                setStatus('Invalid verification link. Please request a new one.');
                router.push('/register');
            }
        };
        
        verifyAndSignIn();
    }, [auth, firestore, router, toast]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <AverzoLogo />
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" />
                <p className="font-medium">{status}</p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <FirebaseClientProvider>
            <VerifyEmailPageContent />
        </FirebaseClientProvider>
    );
}
