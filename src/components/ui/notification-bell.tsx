'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from './button';
import { Bell, BellOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export function NotificationBell() {
    const { firebaseApp, firestore } = useFirebase();
    const { user } = useAuth();
    const { toast } = useToast();
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');
    const [isLoading, setIsLoading] = useState(false);

    const checkSupportAndPermission = useCallback(async () => {
        const supported = await isSupported();
        if (supported) {
            setPermissionStatus(Notification.permission);
        } else {
            setPermissionStatus('unsupported');
        }
    }, []);

    useEffect(() => {
        checkSupportAndPermission();
    }, [checkSupportAndPermission]);

    const requestPermissionAndRegister = async () => {
        if (permissionStatus === 'denied') {
            toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: 'Please enable notifications in your browser settings.',
            });
            return;
        }

        if (permissionStatus === 'granted') {
             toast({
                title: 'Notifications Already Enabled',
            });
            return;
        }
        
        if (!firebaseApp || !firestore) {
             toast({ variant: 'destructive', title: 'Error', description: 'Firebase service is not available.'});
             return;
        }

        setIsLoading(true);

        try {
            const status = await Notification.requestPermission();
            setPermissionStatus(status);
            
            if (status === 'granted') {
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
                if (!vapidKey) {
                    throw new Error("VAPID key is missing. Push notifications cannot be enabled.");
                }

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
        } finally {
            setIsLoading(false);
        }
    };
    
    if (permissionStatus === 'unsupported') {
        return null;
    }

    const getTooltipContent = () => {
        switch (permissionStatus) {
            case 'granted':
                return 'Notifications are enabled';
            case 'denied':
                return 'Notifications are blocked';
            default:
                return 'Enable notifications';
        }
    };
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-auto w-auto p-0" onClick={requestPermissionAndRegister} disabled={isLoading}>
                    {permissionStatus === 'denied' ? <BellOff size={22} className="cursor-pointer hover:text-destructive transition-colors" /> : <Bell size={22} className="cursor-pointer hover:text-primary transition-colors" />}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{getTooltipContent()}</p>
            </TooltipContent>
        </Tooltip>
    );
}
