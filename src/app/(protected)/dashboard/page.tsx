
'use client';

import { useAuth } from '@/hooks/use-auth';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

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

  // This page is now only for Admins.
  // Other roles are redirected by the parent layouts.
  return <AdminDashboard />;
}
