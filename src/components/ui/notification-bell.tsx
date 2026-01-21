
'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from './button';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { updateFcmToken } from '@/actions/user-actions';

export function NotificationBell() {
    const { firebaseApp } = useFirebase();
    const { user } = useAuth();
    const { toast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkPermission = async () => {
        try {
          const supported = await isSupported();
          if (supported && 'Notification' in window) {
              setPermission(Notification.permission);
          } else {
              setPermission('denied'); // Treat unsupported as denied
          }
        } catch(e) {
          console.error("Error checking notification support:", e);
          setPermission('denied');
        } finally {
          setIsLoading(false);
        }
      }
      checkPermission();
    }, []);

    const handleEnableNotifications = async () => {
        const supported = await isSupported();
        if (!("Notification" in window) || !supported) {
            toast({ variant: 'destructive', title: "This browser doesn't support notifications." });
            return;
        }

        if (permission === 'denied') {
            toast({
                variant: 'destructive',
                title: 'Notifications Blocked',
                description: 'Please enable notifications for this site in your browser settings.',
            });
            return;
        }

        if (permission === 'granted') {
             toast({ title: 'Notifications are already enabled.' });
            return;
        }
        
        setIsLoading(true);

        try {
            const status = await Notification.requestPermission();
            setPermission(status);
            
            if (status === 'granted') {
                if (!firebaseApp) throw new Error('Firebase service is not available.');
                
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
                if (!vapidKey) throw new Error("VAPID key is missing from environment variables.");
                
                const messaging = getMessaging(firebaseApp);
                const fcmToken = await getToken(messaging, { vapidKey });
                
                if (fcmToken && user) {
                    const result = await updateFcmToken(user.uid, fcmToken);
                    if (result && !result.success) { // Ensure result is not null before checking success
                        throw new Error(result.error || "Failed to save token.");
                    }
                }
                
                toast({ title: "Notifications Enabled!", description: "You're all set to receive updates." });
            } else {
                toast({ variant: 'destructive', title: 'Notifications Disabled', description: 'You can change this in your browser settings.' });
            }
        } catch (error: any) {
            console.error('Error setting up push notifications:', error);
            toast({ variant: 'destructive', title: 'Notification Setup Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) {
        return (
             <div className="relative p-2">
                <Bell className="h-6 w-6 text-gray-400 animate-pulse" />
             </div>
        )
    }

    const getIconAndTooltip = () => {
        switch (permission) {
            case 'granted':
                return { icon: <BellRing className="h-6 w-6 text-green-600" />, tooltip: 'Notifications are enabled' };
            case 'denied':
                return { icon: <BellOff className="h-6 w-6 text-red-500" />, tooltip: 'Notifications are blocked' };
            default:
                 return { icon: <Bell className="h-6 w-6 text-gray-600 group-hover:animate-bounce" />, tooltip: 'Enable notifications' };
        }
    };

    const { icon, tooltip } = getIconAndTooltip();
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button onClick={handleEnableNotifications} className="relative p-2 rounded-full hover:bg-gray-100 transition-all group" title={tooltip} disabled={isLoading}>
                    {icon}
                    {permission === "default" && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}
