
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
        <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userData) {
    return <p>Could not load user data.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">
        {userData.role === 'admin' ? 'Vendor Management' : 'My Vendor Dashboard'}
      </h1>
      {userData.role === 'admin' ? <AdminVendorView /> : <VendorDashboard />}
    </div>
  );
}
