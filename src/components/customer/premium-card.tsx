'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserData } from '@/types/user';
import { Wifi } from 'lucide-react';
import AverzoLogo from '../averzo-logo';
import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ChipIcon = () => (
  <svg width="54" height="42" viewBox="0 0 54 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="54" height="42" rx="4" fill="url(#chip-gradient)"/>
    <rect x="4" y="4" width="46" height="34" rx="2" fill="url(#chip-inner-gradient)"/>
    <path d="M27 4V18" stroke="#A88C4B" strokeWidth="1.5"/>
    <path d="M27 24V38" stroke="#A88C4B" strokeWidth="1.5"/>
    <path d="M4 21H20" stroke="#A88C4B" strokeWidth="1.5"/>
    <path d="M34 21H50" stroke="#A88C4B" strokeWidth="1.5"/>
    <defs>
      <linearGradient id="chip-gradient" x1="0" y1="0" x2="54" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDEBC5"/>
        <stop offset="1" stopColor="#D8AE5B"/>
      </linearGradient>
      <linearGradient id="chip-inner-gradient" x1="4" y1="4" x2="50" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);


const WorldPattern = ({ className }: { className?: string }) => (
    <svg
      className={cn("absolute inset-0 w-full h-full opacity-[0.03]", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id="world-pattern"
          patternUnits="userSpaceOnUse"
          width="40"
          height="40"
          patternTransform="scale(2)"
        >
          <path
            d="M 10,10 C 10,10 10,20 20,20 C 30,20 30,10 30,10"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#world-pattern)" />
    </svg>
);

const HologramIcon = () => (
    <div className="w-16 h-10 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 opacity-70 rounded-md flex items-center justify-center">
        <AverzoLogo className="text-white/50 text-sm" />
    </div>
);


export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardNumber = `AVZ-${userData.uid.substring(0, 4).toUpperCase()}-${userData.uid.substring(4, 8).toUpperCase()}-${userData.uid.substring(8, 12).toUpperCase()}`;

  const tierStyles = {
    silver: {
        bg: 'bg-gradient-to-br from-slate-200 via-white to-slate-100',
        text: 'text-slate-800',
        logo: 'text-slate-800',
        secondaryText: 'text-slate-500',
        highlight: 'text-primary',
    },
    gold: {
        bg: 'bg-gradient-to-br from-amber-400 via-yellow-200 to-yellow-500',
        text: 'text-amber-950',
        logo: 'text-amber-950',
        secondaryText: 'text-amber-900/70',
        highlight: 'text-white',
    },
    platinum: {
        bg: 'bg-gradient-to-br from-slate-900 via-black to-slate-800',
        text: 'text-white',
        logo: 'text-white',
        secondaryText: 'text-slate-400',
        highlight: 'text-primary',
    },
  };

  const currentTier = userData.membershipTier || 'silver';
  const styles = tierStyles[currentTier];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const memberSince = userData.createdAt?.toDate ? format(userData.createdAt.toDate(), 'MM/yy') : '01/24';
  const validThru = '12/28'; // Placeholder
  const cvc = userData.uid.substring(12, 15).toUpperCase() || '123';

  return (
    <div 
        className="w-full max-w-lg aspect-[85.6/54] [perspective:1000px] cursor-pointer"
        onClick={handleFlip}
        title="Click to flip"
    >
        <motion.div
            className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
            {/* Front of the card */}
            <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden",
                styles.bg, styles.text
            )}>
                <WorldPattern />
                <div className="flex justify-between items-start z-10">
                    <AverzoLogo className={cn("text-3xl", styles.logo)} />
                     <div className="text-right">
                        <p className={cn("font-black text-lg capitalize", styles.highlight)}>{currentTier}</p>
                        <p className={cn("text-xs", styles.secondaryText)}>Membership</p>
                    </div>
                </div>

                <div className="z-10">
                    <ChipIcon />
                    <p className="font-mono text-xl md:text-2xl tracking-[0.2em] mt-3">{cardNumber.split('-').slice(1).join(' ')}</p>
                    <div className="flex items-center gap-4 text-xs mt-2">
                        <div className='text-center'>
                           <p className={cn("text-[8px] opacity-70", styles.secondaryText)}>MEMBER SINCE</p>
                           <p className='font-mono font-bold'>{memberSince}</p>
                        </div>
                         <div className='text-center'>
                           <p className={cn("text-[8px] opacity-70", styles.secondaryText)}>VALID THRU</p>
                           <p className='font-mono font-bold'>{validThru}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-end z-10">
                     <p className="font-semibold tracking-wider text-lg uppercase">{userData.displayName}</p>
                     <Wifi size={28} className="-rotate-90" />
                </div>
            </div>

            {/* Back of the card */}
             <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden",
                styles.bg, styles.text
            )}>
                 <div className="w-full h-16 bg-black mt-8"></div>

                 <div className="px-6 space-y-2 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-full h-10 bg-white p-1 rounded-md text-right italic font-mono text-sm pr-2 text-black flex items-center justify-end">
                            {cvc}
                        </div>
                    </div>
                    {userData.phone && (
                        <p className={cn("text-xs", styles.secondaryText)}>Phone: {userData.phone}</p>
                    )}
                 </div>

                <div className="px-4 py-4 z-10 flex items-center justify-between">
                    <div className="w-3/4">
                       <Barcode 
                            value={userData.uid}
                            height={40}
                            width={1.5}
                            background="transparent"
                            lineColor={currentTier === 'platinum' ? 'white' : 'black'}
                            displayValue={false}
                            margin={0}
                        />
                    </div>
                    <HologramIcon />
                </div>
            </div>
        </motion.div>
    </div>
  );
}
