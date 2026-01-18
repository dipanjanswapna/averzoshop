'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldWishlistPage() {
  const router = useRouter();
  useEffect(() => {
    // This page is deprecated. Redirecting to the new customer wishlist page.
    router.replace('/customer/my-wishlist');
  }, [router]);

  return (
    <div className="container py-20 text-center">
      <p>Redirecting to your wishlist...</p>
    </div>
  );
}
