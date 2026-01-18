'use client';

import { useEffect } from 'react';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function NotificationManager() {
    const { firebaseApp } = useFirebase();
    const { toast } = useToast();

    // Handle foreground messages
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        isSupported().then(supported => {
            if (supported && firebaseApp && Notification.permission === 'granted') {
                const messaging = getMessaging(firebaseApp);
                unsubscribe = onMessage(messaging, (payload) => {
                    console.log('Message received in foreground.', payload);
                    toast({
                        title: payload.notification?.title,
                        description: payload.notification?.body,
                    });
                });
            }
        });
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [firebaseApp, toast]);

    return null; // This component is now only for listening, not for UI.
}
