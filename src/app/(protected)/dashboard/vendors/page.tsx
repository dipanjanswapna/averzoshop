
'use client';

import { useAuth } from '@/hooks/use-auth';
import { AdminVendorView } from '@/components/dashboard/admin-vendor-view';
import { VendorDashboard } from '@/components/dashboard/vendor-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendorsPage() {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userData) {
    return <p>Could not load user data.</p>;
  }

  return (
    <>
      {userData.role === 'admin' ? <AdminVendorView /> : <VendorDashboard />}
    </>
  );
}
