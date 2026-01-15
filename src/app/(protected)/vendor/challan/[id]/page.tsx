
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { DeliveryChallan } from '@/components/vendor/delivery-challan';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { DeliveryChallan as ChallanType } from '@/types/logistics';
import type { UserData } from '@/types/user';
import type { Outlet } from '@/types/outlet';

export default function ChallanPage() {
  const params = useParams();
  const { id } = params;
  const { firestore } = useFirebase();
  const [challan, setChallan] = useState<ChallanType | null>(null);
  const [vendor, setVendor] = useState<UserData | null>(null);
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !id) return;

    const fetchChallanData = async () => {
      setIsLoading(true);
      try {
        const challanRef = doc(firestore, 'delivery_challans', id as string);
        const challanSnap = await getDoc(challanRef);

        if (challanSnap.exists()) {
          const challanData = { id: challanSnap.id, ...challanSnap.data() } as ChallanType;
          setChallan(challanData);

          // Fetch vendor and outlet details
          const vendorRef = doc(firestore, 'users', challanData.vendorId);
          const outletRef = doc(firestore, 'outlets', challanData.outletId);

          const [vendorSnap, outletSnap] = await Promise.all([getDoc(vendorRef), getDoc(outletRef)]);

          if (vendorSnap.exists()) {
            setVendor(vendorSnap.data() as UserData);
          }
          if (outletSnap.exists()) {
            setOutlet(outletSnap.data() as Outlet);
          }
        } else {
          console.error("No such challan!");
        }
      } catch (error) {
        console.error("Error fetching challan details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallanData();
  }, [firestore, id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!challan || !vendor || !outlet) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Challan Not Found</h1>
        <p className="text-muted-foreground">The requested delivery challan could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
       <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold font-headline">Delivery Challan</h1>
        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Challan</Button>
      </div>
      <div className="printable-area flex justify-center bg-gray-100 py-8">
         <DeliveryChallan challan={challan} vendor={vendor} outlet={outlet} />
      </div>
    </div>
  );
}
