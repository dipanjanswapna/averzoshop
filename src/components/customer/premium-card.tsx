'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserData } from '@/types/user';
import { Nfc } from 'lucide-react';
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
        bg: 'bg-gradient-to-br from-slate-100 via-white to-gray-200',
        text: 'text-gray-800',
        logo: 'text-gray-800',
        secondaryText: 'text-gray-500',
        highlight: 'text-blue-700',
        textShadow: '',
    },
    gold: {
        bg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500',
        text: 'text-black/80',
        logo: 'text-black/80',
        secondaryText: 'text-black/60',
        highlight: 'text-white',
        textShadow: 'text-shadow-[0_1px_2px_rgba(0,0,0,0.2)]',
    },
    platinum: {
        bg: 'bg-gradient-to-br from-slate-800 via-black to-slate-900',
        text: 'text-white',
        logo: 'text-white',
        secondaryText: 'text-slate-400',
        highlight: 'text-cyan-400',
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
                "absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden",
                styles.bg, styles.text
            )}>
                <WorldPattern />
                {/* Header */}
                <div className="flex justify-between items-start z-10">
                    <AverzoLogo className={cn("text-3xl", styles.logo)} />
                     <div className="text-right">
                        <p className={cn("font-black text-lg capitalize", styles.highlight)}>{currentTier}</p>
                        <p className={cn("text-xs -mt-1", styles.secondaryText)}>Membership</p>
                    </div>
                </div>

                {/* Middle section with Chip and Card Number */}
                <div className="z-10">
                    <ChipIcon />
                    <p className="font-mono text-xl md:text-2xl tracking-[0.2em] mt-3">{cardNumber.split('-').slice(1).join(' ')}</p>
                </div>
                
                {/* Footer */}
                <div className="flex justify-between items-end z-10 text-xs">
                     <div className='text-left'>
                        <p className={cn("text-[9px] uppercase opacity-70", styles.secondaryText)}>Card Holder</p>
                        <p className="font-semibold tracking-wider uppercase">{userData.displayName}</p>
                     </div>
                     <div className="flex gap-4 text-right">
                        <div>
                            <p className={cn("text-[9px] uppercase opacity-70", styles.secondaryText)}>Member Since</p>
                            <p className="font-semibold font-mono tracking-wider">{memberSince}</p>
                        </div>
                        <div>
                            <p className={cn("text-[9px] uppercase opacity-70", styles.secondaryText)}>Valid Thru</p>
                            <p className="font-semibold font-mono tracking-wider">{validThru}</p>
                        </div>
                     </div>
                </div>
            </div>

            {/* Back of the card */}
             <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden",
                styles.bg, styles.text
            )}>
                 <div className="w-full h-16 bg-black mt-8"></div>

                 <div className="px-6 mt-4 space-y-1 z-10 flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                        <p className={cn("text-[10px] uppercase", styles.secondaryText)}>Signature</p>
                        <div className="h-10 bg-white/80 p-1 rounded-md flex items-center justify-end">
                            <p className="italic font-mono text-sm pr-4 text-black">
                                {cvc}
                            </p>
                        </div>
                    </div>
                    <div className="ml-4">
                        <HologramIcon />
                    </div>
                 </div>

                <div className="px-6 py-4 mt-auto z-10 flex flex-col items-center">
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
