'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BellRing, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NotifyMeButtonProps {
  productId: string;
  productName: string;
}

export function NotifyMeButton({ productId, productName }: NotifyMeButtonProps) {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  
  const email = user?.email || guestEmail;

  useEffect(() => {
    const checkSubscription = async () => {
      if (!firestore || !email || !productId) return;
      
      const q = query(
        collection(firestore, 'notification_subscriptions'),
        where('email', '==', email),
        where('productId', '==', productId)
      );
      
      const querySnapshot = await getDocs(q);
      setIsSubscribed(!querySnapshot.empty);
    };

    checkSubscription();
  }, [firestore, email, productId]);

  const handleSubscribe = async (emailToSubscribe: string) => {
    if (!firestore || !productId) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(firestore, 'notification_subscriptions'), {
        email: emailToSubscribe,
        productId,
        userId: user?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      setIsSubscribed(true);
      toast({
        title: 'Subscription Confirmed!',
        description: `We'll notify you at ${emailToSubscribe} when ${productName} is back in stock.`,
      });
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: 'Could not subscribe for notifications. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
  
  const handleClick = () => {
    if (isSubscribed) return;
    
    if (user) {
      handleSubscribe(user.email!);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleGuestSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!guestEmail || !emailRegex.test(guestEmail)) {
          toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
          return;
      }
      handleSubscribe(guestEmail);
  }

  return (
    <>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={isSubscribed || isLoading}
        className="w-full h-12"
      >
        {isSubscribed ? (
          <>
            <Check size={20} className="mr-2" /> Subscribed
          </>
        ) : isLoading ? (
          'Subscribing...'
        ) : (
          <>
            <BellRing size={20} className="mr-2" /> Notify Me When Available
          </>
        )}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Get Notified</DialogTitle>
                  <DialogDescription>
                      This product is out of stock. Enter your email and we'll notify you when it's available.
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGuestSubscribe}>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="guest-email">Email Address</Label>
                    <Input
                        id="guest-email"
                        type="email"
                        placeholder="name@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                    />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Subscribing...' : 'Notify Me'}
                    </Button>
                </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
