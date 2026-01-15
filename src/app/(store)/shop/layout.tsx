'use client';
import { FirebaseClientProvider } from '@/firebase';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
