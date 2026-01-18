'use client';

import { useFcmToken } from '@/hooks/use-fcm';

/**
 * এই কম্পোনেন্টটি ব্যাকগ্রাউন্ডে ইউজারের টোকেন ম্যানেজ করবে
 */
export function FcmHandler({ userId }: { userId: string | undefined }) {
  // আপনার তৈরি করা হুকটি এখানে কল করুন
  useFcmToken(userId);

  // এটি স্ক্রিনে কিছু দেখাবে না, শুধু লজিক রান করবে
  return null;
}