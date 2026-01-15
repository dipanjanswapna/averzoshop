'use client';

import { AdminVendorView } from '@/components/dashboard/admin-vendor-view';

export default function VendorsPage() {
  // This page is now exclusively for admins to view all vendors.
  // The VendorDashboard is located at /vendor/dashboard.
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Vendor Management</h1>
      <AdminVendorView />
    </div>
  );
}
