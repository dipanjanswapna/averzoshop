'use client';

import { useEffect } from 'react';
import { useFcmToken } from '@/hooks/use-fcm';

export function FcmHandler({ userId }: { userId: string | undefined }) {
  // This hook will handle the FCM token logic.
  useFcmToken(userId);
  
  // This component renders nothing.
  return null;
}
