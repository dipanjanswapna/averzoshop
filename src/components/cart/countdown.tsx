'use client';
import { useState, useEffect } from 'react';

const Countdown = ({ expiryTimestamp }: { expiryTimestamp: number }) => {
  const calculateTimeLeft = () => {
    const difference = expiryTimestamp - Date.now();
    if (difference <= 0) return { minutes: 0, seconds: 0 };
    return {
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryTimestamp]);

  if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      return <span className="font-bold text-destructive">Expired!</span>;
  }

  return (
    <span className="font-bold text-primary tabular-nums">
      {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
};
export default Countdown;
