'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserData } from '@/types/user';
import { Wifi, Phone, Nfc } from 'lucide-react';
import AverzoLogo from '../averzo-logo';
import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

                <div>
                    <Nfc size={32} className="opacity-80 mb-2" />
                    <p className="font-mono text-xl md:text-2xl tracking-[0.2em]">{cardNumber.split('-').slice(1).join(' ')}</p>
                    <div className="flex items-center gap-4 text-xs mt-2">
                        <div className='text-center'>
                           <p className='opacity-70 text-[8px]'>MEMBER SINCE</p>
                           <p className='font-mono font-bold'>{memberSince}</p>
                        </div>
                         <div className='text-center'>
                           <p className='opacity-70 text-[8px]'>VALID THRU</p>
                           <p className='font-mono font-bold'>{validThru}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-end">
                     <p className="font-semibold tracking-wider text-lg uppercase">{userData.displayName}</p>
                     <Wifi size={28} className="-rotate-90" />
                </div>
            </div>

            {/* Back of the card */}
             <div className={cn(
                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] text-black bg-gradient-to-br rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden",
                 tierGradients[currentTier]
            )}>
                 <div className="w-full h-16 bg-black mt-8"></div>

                 <div className="px-6 space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="w-2/3 h-10 bg-white p-1 rounded-md">
                            <p className="text-right italic font-mono text-sm pr-2">{cvc}</p>
                        </div>
                        <p className="text-white/80 text-[10px] w-1/3 leading-tight">CVC</p>
                    </div>
                    {userData.phone && (
                        <p className="text-xs text-white/70">Phone: {userData.phone}</p>
                    )}
                 </div>

                <div className="px-4 py-4 bg-white/70 backdrop-blur-sm">
                    <Barcode 
                        value={userData.uid}
                        height={40}
                        width={1.5}
                        background="transparent"
                        lineColor="black"
                        displayValue={false}
                        margin={0}
                    />
                </div>
            </div>
        </motion.div>
    </div>
  );
}
