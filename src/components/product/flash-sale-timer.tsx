'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface FlashSaleTimerProps {
  endDate: any; // Can be Firestore Timestamp or string
}

export function FlashSaleTimer({ endDate }: FlashSaleTimerProps) {
  const calculateTimeLeft = () => {
    const expiry = endDate?.toDate ? endDate.toDate() : new Date(endDate);
    const difference = +expiry - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = [
    { label: 'days', value: timeLeft.days },
    { label: 'hours', value: timeLeft.hours },
    { label: 'mins', value: timeLeft.minutes },
    { label: 'secs', value: timeLeft.seconds },
  ].filter(item => timeLeft.days > 0 || item.label !== 'days').map(item => (
    <React.Fragment key={item.label}>
      <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{String(item.value).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase opacity-80">{item.label}</span>
      </div>
      {item.label !== 'secs' && <span className="text-xl font-bold opacity-50">:</span>}
    </React.Fragment>
  ));
  
  const allZero = Object.values(timeLeft).every(val => val === 0);

  if (allZero) {
    return (
        <div className="bg-muted text-muted-foreground p-3 rounded-lg text-center font-bold">
            Flash Sale has ended!
        </div>
    );
  }

  return (
    <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center justify-center gap-4">
        <Timer size={24} />
        <div className="flex items-center gap-2 font-mono">
           {timerComponents}
        </div>
    </div>
  );
}
