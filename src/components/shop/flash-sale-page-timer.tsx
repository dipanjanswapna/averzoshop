'use client';
import { useState, useEffect } from 'react';

interface FlashSaleTimerProps {
  endDate: Date;
}

export function FlashSalePageTimer({ endDate }: FlashSaleTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +endDate - +new Date();
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
  
  const allZero = Object.values(timeLeft).every(val => val === 0);

  if (allZero) {
    return (
        <div className="text-xl font-bold text-center p-4 bg-black/20 rounded-lg">Sale Ended!</div>
    );
  }

  return (
    <div className="space-y-2">
        <p className="text-sm font-bold text-center lg:text-left text-yellow-300">Ending in:</p>
        <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 font-mono bg-black/20 p-3 rounded-lg border border-white/20 backdrop-blur-sm w-fit">
        {timeLeft.days > 0 && (
            <>
                <div className="flex flex-col items-center px-2">
                    <span className="text-xl md:text-2xl font-black">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase opacity-75">Days</span>
                </div>
                <span className="text-xl md:text-2xl font-black opacity-50">:</span>
            </>
        )}
        <div className="flex flex-col items-center px-2">
            <span className="text-xl md:text-2xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase opacity-75">Hours</span>
        </div>
        <span className="text-xl md:text-2xl font-black opacity-50">:</span>
        <div className="flex flex-col items-center px-2">
            <span className="text-xl md:text-2xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase opacity-75">Mins</span>
        </div>
        <span className="text-xl md:text-2xl font-black opacity-50">:</span>
        <div className="flex flex-col items-center px-2">
            <span className="text-xl md:text-2xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase opacity-75">Secs</span>
        </div>
        </div>
    </div>
  );
}
