'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserData } from '@/types/user';
import { Wifi, Nfc } from 'lucide-react';
import AverzoLogo from '../averzo-logo';
import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ChipIcon = () => (
  <div className="w-12 h-10 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 p-1">
      <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-sm border border-yellow-700/50 flex flex-col justify-between p-1">
          <div className="h-2 w-4 bg-yellow-400/50 rounded-sm mx-auto"></div>
          <div className="h-2 w-8 bg-yellow-400/50 rounded-sm mx-auto"></div>
      </div>
  </div>
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
    <div className="w-14 h-10 bg-gradient-to-br from-blue-300 via-pink-400 to-purple-500 opacity-80 rounded-md flex items-center justify-center shadow-inner">
        <AverzoLogo className="text-white/50 text-xs" />
    </div>
);


export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardNumber = `AVZ-${userData.uid.substring(0, 4).toUpperCase()}-${userData.uid.substring(4, 8).toUpperCase()}-${userData.uid.substring(8, 12).toUpperCase()}`;

  const tierStyles = {
    silver: {
        bg: 'bg-gradient-to-br from-slate-200 via-white to-slate-300',
        text: 'text-slate-800',
        logo: 'text-slate-800',
        secondaryText: 'text-slate-500',
        highlight: 'text-blue-600',
        textShadow: '',
    },
    gold: {
        bg: 'bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-500',
        text: 'text-white',
        logo: 'text-white',
        secondaryText: 'text-amber-100',
        highlight: 'text-white',
        textShadow: 'text-shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
    },
    platinum: {
        bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-black',
        text: 'text-white',
        logo: 'text-white',
        secondaryText: 'text-slate-400',
        highlight: 'text-blue-400',
        textShadow: 'text-shadow-[0_1px_3px_rgba(0,0,0,0.5)]',
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
            className={cn("relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700", styles.textShadow)}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
            {/* Front of the card */}
            <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col justify-between overflow-hidden",
                styles.bg, styles.text
            )}>
                <WorldPattern />
                <div className="flex justify-between items-start z-10">
                    <AverzoLogo className={cn("text-2xl md:text-3xl", styles.logo)} />
                     <div className="text-right">
                        <p className={cn("font-black text-base md:text-lg capitalize", styles.highlight)}>{currentTier}</p>
                        <p className={cn("text-[10px] md:text-xs", styles.secondaryText)}>Membership</p>
                    </div>
                </div>

                <div className="z-10">
                    <div className="flex items-center gap-4">
                        <ChipIcon />
                        <Nfc size={24} className="opacity-70" />
                    </div>
                    <p className="font-mono text-lg md:text-xl lg:text-2xl tracking-widest mt-2 md:mt-3">{cardNumber.split('-').slice(1).join(' ')}</p>
                </div>
                
                <div className="flex justify-between items-end z-10">
                     <div className='text-left'>
                        <p className={cn("text-[8px] opacity-70", styles.secondaryText)}>Card Holder</p>
                        <p className="font-semibold tracking-wider text-sm md:text-base uppercase">{userData.displayName}</p>
                     </div>
                     <div className='text-right'>
                        <p className={cn("text-[8px] opacity-70", styles.secondaryText)}>Phone</p>
                        <p className="font-semibold tracking-wider text-sm md:text-base">{userData.phone || 'N/A'}</p>
                     </div>
                </div>
            </div>

            {/* Back of the card */}
             <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden",
                styles.bg, styles.text
            )}>
                 <div className="w-full h-12 md:h-16 bg-black mt-6 md:mt-8"></div>

                 <div className="px-4 md:px-6 mt-4 space-y-1 z-10">
                    <p className={cn("text-[10px] uppercase", styles.secondaryText)}>Signature</p>
                    <div className="flex items-center gap-4 h-8 md:h-10 bg-white/80 p-1 rounded-md">
                        <div className="flex-1 text-right italic font-mono text-sm pr-2 text-black flex items-center justify-end">
                            {cvc}
                        </div>
                    </div>
                 </div>

                <div className="px-4 py-2 md:py-4 mt-auto z-10 flex flex-col items-center">
                    <Barcode 
                        value={userData.uid}
                        height={40}
                        width={1.5}
                        background="transparent"
                        lineColor={currentTier === 'platinum' ? 'white' : 'black'}
                        displayValue={false}
                        margin={0}
                    />
                    <p className="text-[8px] font-mono tracking-widest mt-1 opacity-70">{userData.uid}</p>
                </div>
            </div>
        </motion.div>
    </div>
  );
}
