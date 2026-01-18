'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { BellOff, BellRing } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function NotificationManager() {
    const { firebaseApp, firestore } = useFirebase();
    const { user } = useAuth();
    const { toast } = useToast();
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);

    const checkSupportAndPermission = useCallback(async () => {
        const supported = await isSupported();
        if (supported) {
            setPermissionStatus(Notification.permission);
            if (Notification.permission === 'default') {
                // Wait a bit before showing the banner to not be too intrusive
                setTimeout(() => setShowPermissionBanner(true), 5000);
            }
        } else {
            setPermissionStatus('unsupported');
        }
    }, []);

    useEffect(() => {
        checkSupportAndPermission();
    }, [checkSupportAndPermission]);

    // Handle foreground messages
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (permissionStatus === 'granted' && firebaseApp) {
            const messaging = getMessaging(firebaseApp);
            unsubscribe = onMessage(messaging, (payload) => {
                console.log('Message received in foreground.', payload);
                toast({
                    title: payload.notification?.title,
                    description: payload.notification?.body,
                });
            });
        }
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [permissionStatus, firebaseApp, toast]);


    const requestPermissionAndRegister = async () => {
        setShowPermissionBanner(false);
        if (!firebaseApp || !firestore) {
             toast({ variant: 'destructive', title: 'Error', description: 'Firebase service is not available.'});
             return;
        }

        try {
            const status = await Notification.requestPermission();
            setPermissionStatus(status);
            
            if (status === 'granted') {
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
                if (!vapidKey) {
                    throw new Error("VAPID key is missing. Push notifications cannot be enabled.");
                }

                // Construct service worker URL with config
                const firebaseConfig = firebaseApp.options;
                const configParams = new URLSearchParams(firebaseConfig as Record<string,string>).toString();
                const swUrl = `/firebase-messaging-sw.js?${configParams}`;
                
                const swRegistration = await navigator.serviceWorker.register(swUrl);
                
                const messaging = getMessaging(firebaseApp);
                const fcmToken = await getToken(messaging, { 
                    vapidKey,
                    serviceWorkerRegistration: swRegistration
                });
                
                if (fcmToken && user) {
                    const userRef = doc(firestore, 'users', user.uid);
                    await updateDoc(userRef, { fcmTokens: arrayUnion(fcmToken) });
                    toast({ title: "Notifications Enabled!", description: "You're all set to receive updates." });
                } else if (!user) {
                     toast({ title: "Permission Granted!", description: "Log in to sync your notifications across devices." });
                }
            } else {
                toast({ variant: 'destructive', title: 'Notifications Disabled', description: 'You can enable them from browser settings later.' });
            }
        } catch (error: any) {
            console.error('Error setting up push notifications:', error);
            toast({ variant: 'destructive', title: 'Notification Setup Failed', description: error.message });
        }
    };
    
    // Don't render anything if not supported or permission is not 'default'
    if (!showPermissionBanner || permissionStatus !== 'default') {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 lg:bottom-5 right-5 z-50"
            >
                <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary p-2 rounded-full">
                           <BellRing />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">Stay Updated!</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enable push notifications to get real-time updates on your orders and exclusive offers.
                            </p>
                        </div>
                        <button onClick={() => setShowPermissionBanner(false)} className="text-muted-foreground">
                            <BellOff size={16} />
                        </button>
                    </div>
                     <div className="flex gap-2 mt-4">
                        <Button onClick={() => setShowPermissionBanner(false)} variant="ghost" className="flex-1">Not Now</Button>
                        <Button onClick={requestPermissionAndRegister} className="flex-1">Enable</Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
