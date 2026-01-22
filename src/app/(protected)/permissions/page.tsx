
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bell, CheckCircle, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

type Step = 'location' | 'manualLocation' | 'notification' | 'success';

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

const StepContent = ({ icon: Icon, title, description, children }: { icon: React.ElementType, title: string, description: string, children: React.ReactNode }) => (
    <motion.div
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
    >
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                    <Icon size={40} />
                </div>
                <CardTitle className="mt-4 font-headline">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    </motion.div>
);

export default function PermissionsPage() {
  const [step, setStep] = useState<Step>('location');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, firestore } = useAuth();

  const handleLocationRequest = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation is not supported by your browser.' });
      setStep('manualLocation');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (user && firestore) {
            // Here you would typically save the coordinates to the user's profile.
            // For now, we'll just log it and proceed.
            console.log("Location obtained:", { latitude, longitude });
        }
        toast({ title: "Location access granted!" });
        setIsLoading(false);
        setStep('notification');
      },
      (error) => {
        console.warn(`Geolocation error: ${error.message}`);
        toast({ variant: 'destructive', title: 'Location Access Denied', description: 'Please enter your location manually.' });
        setIsLoading(false);
        setStep('manualLocation');
      }
    );
  };
  
   const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const location = formData.get('location') as string;

    if (!location.trim()) {
        toast({ variant: 'destructive', title: 'Please enter a location.' });
        return;
    }
    
     if (user && firestore) {
        // A simplified address object is created.
        const address = {
            id: Date.now().toString(),
            label: 'Primary',
            name: user.displayName || 'Default User',
            phone: user.phoneNumber || '',
            streetAddress: location,
            area: location,
            district: 'N/A',
            division: 'N/A',
            upazila: 'N/A',
        };
        try {
            await updateDoc(doc(firestore, 'users', user.uid), {
                addresses: arrayUnion(address)
            });
        } catch (error) {
            console.error("Error saving manual address:", error);
        }
    }
    
    toast({ title: `Location set to ${location}` });
    setStep('notification');
  };

  const handleNotificationRequest = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({ title: "Notifications enabled!" });
      } else {
        toast({ variant: 'destructive', title: 'Notifications were not enabled.' });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      toast({ variant: 'destructive', title: 'Could not request notification permission.' });
    } finally {
      setIsLoading(false);
      setStep('success');
    }
  };

  const finishOnboarding = () => {
    // This assumes the user has a role and redirects them appropriately.
    router.replace('/'); 
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <AnimatePresence mode="wait">
        {step === 'location' && (
          <StepContent 
            key="location"
            icon={MapPin} 
            title="Enable Location Access" 
            description="To provide you with better service and faster delivery, we need to know your location."
          >
            <Button onClick={handleLocationRequest} className="w-full h-12" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Allow Location Access
            </Button>
            <Button variant="link" className="w-full mt-2" onClick={() => setStep('manualLocation')}>
                Enter Manually
            </Button>
          </StepContent>
        )}
        
         {step === 'manualLocation' && (
          <StepContent 
            key="manual"
            icon={MapPin} 
            title="Enter Your Location" 
            description="Since we couldn't get your location automatically, please enter your city or area."
          >
            <form onSubmit={handleManualLocationSubmit} className="space-y-4">
                <Input name="location" placeholder="e.g., Dhaka, Bangladesh" required />
                <Button type="submit" className="w-full h-12">
                    Continue
                </Button>
            </form>
          </StepContent>
        )}

        {step === 'notification' && (
           <StepContent 
            key="notification"
            icon={Bell} 
            title="Enable Notifications" 
            description="Stay updated with your order status and get notified about exclusive offers and deals."
          >
            <Button onClick={handleNotificationRequest} className="w-full h-12" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enable Notifications
            </Button>
             <Button variant="link" className="w-full mt-2" onClick={() => setStep('success')}>
                Skip for now
            </Button>
          </StepContent>
        )}

        {step === 'success' && (
            <StepContent 
                key="success"
                icon={CheckCircle} 
                title="Setup Complete!" 
                description="You're all set. Enjoy a personalized and seamless shopping experience with Averzo."
            >
                <Button onClick={finishOnboarding} className="w-full h-12">
                    Start Shopping
                </Button>
            </StepContent>
        )}
      </AnimatePresence>
    </div>
  );
}
