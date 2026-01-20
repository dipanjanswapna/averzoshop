'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserData } from '@/types/user';
import { Wifi, Phone } from 'lucide-react';
import AverzoLogo from '../averzo-logo';
import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';

export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardNumber = `AVZ-${userData.uid.substring(0, 4).toUpperCase()}-${userData.uid.substring(4, 8).toUpperCase()}-${userData.uid.substring(8, 12).toUpperCase()}`;

  const tierGradients = {
    silver: 'from-slate-400 via-gray-300 to-slate-400',
    gold: 'from-amber-400 via-yellow-300 to-amber-400',
    platinum: 'from-indigo-900 via-slate-800 to-black',
  };
  const currentTier = userData.membershipTier || 'silver';

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
        className="w-full max-w-lg aspect-[8/5] [perspective:1000px] cursor-pointer"
        onClick={handleFlip}
        title="Click to flip"
    >
        <motion.div
            className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
            {/* Front of the card */}
            <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br",
                tierGradients[currentTier]
            )}>
                
                <div className="flex justify-between items-start">
                    <AverzoLogo className="text-white text-3xl" />
                    <div className="text-right">
                        <p className="font-bold text-lg capitalize">{currentTier}</p>
                        <p className="text-xs opacity-80">Membership</p>
                    </div>
                </div>

                <div className="text-center">
                    <div className="bg-white/90 p-2 rounded-lg inline-block shadow-inner">
                        <Barcode 
                            value={userData.uid}
                            height={40}
                            width={1.5}
                            background="transparent"
                            lineColor="black"
                            displayValue={false}
                        />
                    </div>
                    <p className="font-mono text-xs tracking-wider mt-2 opacity-80">{cardNumber}</p>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs uppercase opacity-80">Card Holder</p>
                        <p className="font-semibold tracking-wider text-lg">{userData.displayName}</p>
                        {userData.phone && (
                            <div className="flex items-center gap-2 mt-1">
                                <Phone size={12} />
                                <p className="font-mono text-xs">{userData.phone}</p>
                            </div>
                        )}
                    </div>
                    <Wifi size={28} className="-rotate-90" />
                </div>
            </div>

            {/* Back of the card */}
             <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] text-white rounded-2xl shadow-2xl p-0 flex flex-col justify-between overflow-hidden bg-gradient-to-br",
                tierGradients[currentTier]
            )}>
                 <div className="w-full h-16 bg-black mt-8"></div>
                <div className="px-6 flex items-center gap-4">
                    <div className="w-2/3 h-10 bg-white/80 p-2 text-right italic font-mono text-sm text-black">
                        {userData.uid.substring(0, 12)}
                    </div>
                    <p className="text-white/80 text-[10px] w-1/3 leading-tight">Not for resale. Property of Averzo. If found, please return to any Averzo outlet.</p>
                </div>
                <div className="px-6 py-4 flex justify-between items-center">
                     <AverzoLogo className="text-white text-xl" />
                    <p className="text-white/50 text-[8px] max-w-xs text-right">This card is non-transferable and remains the property of Averzo. Use of this card constitutes acceptance of the terms and conditions of the Averzo Loyalty Program.</p>
                </div>
            </div>
        </motion.div>
    </div>
  );
}
