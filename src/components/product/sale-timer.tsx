'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface SaleTimerProps {
  endDate: string;
}

export function SaleTimer({ endDate }: SaleTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

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

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
     if (value <= 0 && interval !== 'seconds') return null;
    return (
        <div key={interval} className="flex flex-col items-center">
            <span className="text-xl font-bold">{String(value).padStart(2, '0')}</span>
            <span className="text-xs uppercase">{interval}</span>
        </div>
    );
  });

  return (
    <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-center gap-6">
        <Timer size={28} />
        <div className="flex items-center gap-4 font-mono">
           {timerComponents.filter(c => c).length > 0 ? timerComponents : <span>Sale has ended!</span>}
        </div>
    </div>
  );
}
