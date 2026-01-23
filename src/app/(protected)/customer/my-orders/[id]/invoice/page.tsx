'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { PrintableInvoice } from '@/components/order/PrintableInvoice';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { Order } from '@/types/order';
import type { UserData } from '@/types/user';
import { useAuth } from '@/hooks/use-auth';

export default function InvoicePage() {
  const params = useParams();
  const { id } = params;
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !id || !user) return;

    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        const orderRef = doc(firestore, 'orders', id as string);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          
          if (orderData.customerId !== user.uid) {
              console.error("Access denied.");
              setOrder(null);
              return;
          }

          setOrder(orderData);

          const customerRef = doc(firestore, 'users', orderData.customerId);
          const customerSnap = await getDoc(customerRef);
          if (customerSnap.exists()) {
            setCustomer(customerSnap.data() as UserData);
          }

        } else {
          console.error("No such order!");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [firestore, id, user]);

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

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Invoice Not Found</h1>
        <p className="text-muted-foreground">The requested invoice could not be found or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100">
       <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold font-headline">Invoice</h1>
        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
      </div>
      <div className="printable-area flex justify-center py-8">
         <PrintableInvoice order={order} customer={customer} />
      </div>
    </div>
  );
}
