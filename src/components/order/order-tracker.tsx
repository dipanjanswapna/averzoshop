'use client';
import { Check, Package, Clock, Truck, Home, Star, Hand } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

const deliverySteps = [
  { status: 'new', label: 'Order Placed', icon: Check },
  { status: 'preparing', label: 'Preparing', icon: Package },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: Clock },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

const preOrderDeliverySteps = [
    { status: 'pre-ordered', label: 'Pre-ordered', icon: Check },
    { status: 'new', label: 'Processing', icon: Package },
    ...deliverySteps.slice(1)
];

const pickupSteps = [
  { status: 'new', label: 'Order Placed', icon: Check },
  { status: 'preparing', label: 'Preparing', icon: Package },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: Clock },
  { status: 'fulfilled', label: 'Collected', icon: Hand },
];

const preOrderPickupSteps = [
    { status: 'pre-ordered', label: 'Pre-ordered', icon: Check },
    { status: 'new', label: 'Processing', icon: Package },
    ...pickupSteps.slice(2) // from 'ready for pickup' onwards
];


export function OrderTracker({ status, orderType, orderMode }: { status: OrderStatus, orderType: 'regular' | 'pre-order', orderMode: 'delivery' | 'pickup' }) {
    
  let steps;
  if (orderMode === 'delivery') {
      steps = orderType === 'pre-order' ? preOrderDeliverySteps : deliverySteps;
  } else { // pickup
      steps = orderType === 'pre-order' ? preOrderPickupSteps : pickupSteps;
  }

  let currentStepIndex = steps.findIndex(step => step.status === status);

  if (orderType === 'pre-order' && status === 'new') {
    currentStepIndex = 1; // "Processing" is the step after "Pre-ordered"
  }
  
  if (status === 'canceled') {
    return (
        <div className="flex items-center justify-center p-4 bg-destructive/10 text-destructive rounded-lg font-bold">
            Order Canceled
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
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <div key={step.status} className="flex flex-col items-center text-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 border-2",
                isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted-foreground/30 text-muted-foreground',
                isCurrent && "animate-pulse"
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
