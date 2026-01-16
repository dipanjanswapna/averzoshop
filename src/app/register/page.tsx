
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['customer', 'vendor', 'rider'], { required_error: 'Please select a role.' }),
  phone: z.string().min(11, { message: 'Please enter a valid phone number (e.g., 8801...)' }),
});

function RegisterPageContent() {
  const [loading, setLoading] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<'register' | 'verifyPhone'>('register');
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer',
      phone: '',
    },
  });

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved.
        },
      });
    }
  };
  
  const handleSendOtp = async (phoneNumber: string) => {
      if (!auth) return;
      setLoading(true);
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier!;
      const formatPh = '+' + phoneNumber;
      try {
          const confirmation = await signInWithPhoneNumber(auth, formatPh, appVerifier);
          window.confirmationResult = confirmation;
          setStep('verifyPhone');
          toast({ title: "OTP Sent!", description: "Please check your phone for the 6-digit code." });
      } catch (error) {
          console.error(error);
          toast({ variant: "destructive", title: "Failed to send OTP", description: "Too many requests or invalid number." });
      } finally {
          setLoading(false);
      }
  };
  
  const onOTPVerify = async () => {
    if (!window.confirmationResult) {
        toast({ variant: "destructive", title: "Verification failed", description: "Confirmation object not found." });
        return;
    };
    setIsVerifying(true);
    try {
        await window.confirmationResult.confirm(otp);

        const user = auth?.currentUser;
        if (user && firestore) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                isPhoneVerified: true,
                loyaltyPoints: increment(50),
            });
        }
        
        toast({ title: "Verified!", description: "Your phone number is successfully verified. You've earned 50 bonus points!" });
        router.push('/login');

    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Invalid OTP code." });
    } finally {
        setIsVerifying(false);
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Auth service not available.' });
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      const userDocRef = doc(firestore, 'users', user.uid);
      const status = values.role === 'customer' ? 'approved' : 'pending';

      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: values.name,
        role: values.role,
        status: status,
        phone: values.phone,
        isPhoneVerified: false,
        createdAt: new Date().toISOString(),
        loyaltyPoints: 0,
        totalSpent: 0,
        membershipTier: 'silver',
      });
      
      setPhoneToVerify(values.phone);
      await handleSendOtp(values.phone);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
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
          isPhoneVerified: false,
          createdAt: new Date().toISOString(),
          loyaltyPoints: 0,
          totalSpent: 0,
          membershipTier: 'silver',
        });
      } else {
         await setDoc(userDocRef, {
          displayName: user.displayName,
          photoURL: user.photoURL,
        }, { merge: true });
      }

      toast({ title: 'Google Sign-In Successful', description: 'Redirecting...' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <div id="recaptcha-container"></div>
        {step === 'register' ? (
          <>
            <CardHeader className="text-center">
              <AverzoLogo className="mx-auto mb-4" />
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>Join our community and start shopping!</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="8801XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
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
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Processing...' : 'Create Account & Verify'}</Button>
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
        ) : (
          <CardContent className="pt-6">
              <div className="space-y-4 text-center">
                  <AverzoLogo className="mx-auto mb-4" />
                  <h2 className="text-xl font-bold">Enter OTP</h2>
                  <p className="text-sm text-gray-500">Sent to: +{phoneToVerify}</p>
                  <Input 
                      placeholder="Enter 6 digit code" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)}
                  />
                  <Button onClick={onOTPVerify} className="w-full h-12 bg-green-600 hover:bg-green-700" disabled={isVerifying || otp.length < 6}>
                      {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                  </Button>
                  <Button variant="link" onClick={() => setStep('register')}>Back to registration</Button>
              </div>
          </CardContent>
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
