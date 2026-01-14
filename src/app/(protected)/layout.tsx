'use client';
import { FirebaseClientProvider } from '@/firebase';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
