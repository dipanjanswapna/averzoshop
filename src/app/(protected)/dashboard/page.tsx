
'use client';

import { useAuth } from '@/hooks/use-auth';
import { OutletDashboard } from '@/components/dashboard/outlet-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { VendorDashboard } from '@/components/dashboard/vendor-dashboard';

export default function DashboardPage() {
  const { userData, loading } = useAuth();

  if (loading || !userData) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="lg:col-span-4 h-80" />
            <Skeleton className="lg:col-span-3 h-80" />
        </div>
      </div>
    );
  }

  // Render specific dashboards based on user role
  if (userData.role === 'outlet') {
    return <OutletDashboard />;
  }
  
  if (userData.role === 'vendor') {
    return <VendorDashboard />;
  }

  // Default to Admin/Rider dashboard
  return <AdminDashboard />;
}
