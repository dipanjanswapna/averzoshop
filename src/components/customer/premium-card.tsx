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
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-blue-400 to-blue-600',
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
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"></div>
                
                <div className="flex justify-between items-start">
                    <AverzoLogo className="text-white text-3xl" />
                    <div className="text-right">
                        <p className="font-bold text-lg capitalize">{currentTier}</p>
                        <p className="text-xs opacity-80">Membership</p>
                    </div>
                </div>

                <div className="text-center">
                    <div>
                        <Barcode value={userData.uid}
                            height={25}
                            width={1.2}
                            background="transparent"
                            lineColor="white"
                            displayValue={false}
                        />
                    </div>
                    <p className="font-mono text-xs tracking-wider mt-2">{cardNumber}</p>
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
                    <div className="flex items-center gap-2">
                        <Wifi size={24} className="-rotate-90" />
                    </div>
                </div>
            </div>

            {/* Back of the card */}
             <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] text-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br",
                tierGradients[currentTier]
            )}>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"></div>
                <div className="w-full h-12 bg-black mt-4"></div>
                <div className="flex items-center gap-4 mt-4">
                    <div className="w-2/3 h-10 bg-white/80 p-2 text-right italic font-mono text-sm">
                        {userData.uid.substring(0, 12)}
                    </div>
                    <p className="text-white text-xs w-1/3">Not for resale. Property of Averzo. If found, please return to any Averzo outlet.</p>
                </div>
                <div className="flex-1 flex items-center justify-end text-white/80 text-[8px] mt-4">
                    <p>This card is non-transferable and remains the property of Averzo. Use of this card constitutes acceptance of the terms and conditions of the Averzo Loyalty Program.</p>
                </div>

                <div className="text-right mt-2">
                     <AverzoLogo className="text-white text-lg" />
                </div>
            </div>
        </motion.div>
    </div>
  );
}
