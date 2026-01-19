'use client';
import { Check, Package, Clock, Truck, Home, Star } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

const regularSteps = [
  { status: 'new', label: 'Order Placed', icon: Check },
  { status: 'preparing', label: 'Preparing', icon: Package },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: Clock },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

const preOrderSteps = [
    { status: 'pre-ordered', label: 'Pre-ordered', icon: Check },
    { status: 'new', label: 'Processing', icon: Package },
    { status: 'preparing', label: 'Preparing', icon: Package },
    { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: Clock },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: Home },
    { status: 'fulfilled', label: 'Fulfilled', icon: Star },
];

export function OrderTracker({ status, orderType }: { status: OrderStatus, orderType: 'regular' | 'pre-order' }) {
    
  const steps = orderType === 'pre-order' ? preOrderSteps : regularSteps;
  const currentStepIndex = steps.findIndex(step => step.status === status);

  if (status === 'canceled') {
    return (
        <div className="flex items-center justify-center p-4 bg-destructive/10 text-destructive rounded-lg font-bold">
            Order Canceled
        </div>
    )
  }

  // A 'fulfilled' pre-order is a completed state.
  if (status === 'fulfilled') {
       return (
         <div className="flex flex-col items-center justify-center p-4 bg-green-100/50 text-green-700 rounded-lg font-bold">
            <Star className="w-8 h-8 mb-2" />
            Pre-order Fulfilled
        </div>
       )
  }

  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-5 w-full h-1 bg-muted -translate-y-1/2">
        <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <div className="relative flex justify-between">
        {steps.filter(s => s.status !== 'fulfilled').map((step, index) => {
          const isActive = index <= currentStepIndex;
          return (
            <div key={step.status} className="flex flex-col items-center text-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 border-2",
                isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted-foreground/30 text-muted-foreground'
              )}>
                <step.icon size={20} />
              </div>
              <p className={cn(
                  "text-xs mt-2 font-medium w-20 transition-colors duration-300",
                  isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
