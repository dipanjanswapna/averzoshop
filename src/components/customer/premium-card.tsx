
'use client';
import { UserData } from '@/types/user';
import { Wifi } from 'lucide-react';
import Barcode from 'react-barcode';
import AverzoLogo from '../averzo-logo';

export function PremiumCard({ userData }: { userData: UserData }) {

  const cardNumber = `AVZ-${userData.uid.substring(0, 4).toUpperCase()}-${userData.uid.substring(4, 8).toUpperCase()}-${userData.uid.substring(8, 12).toUpperCase()}`;

  const tierGradients = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-blue-400 to-blue-600',
  };
  const currentTier = userData.membershipTier || 'silver';

  return (
    <div className={`relative w-full max-w-lg h-56 text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${tierGradients[currentTier]}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"></div>
        
        <div className="flex justify-between items-start">
            <AverzoLogo className="text-white" />
            <div className="text-right">
                <p className="font-bold text-lg capitalize">{currentTier}</p>
                <p className="text-xs opacity-80">Membership</p>
            </div>
        </div>

        <div className="text-center">
            <Barcode 
                value={userData.uid} 
                height={40} 
                width={1.5} 
                background="transparent" 
                lineColor="white"
                displayValue={false}
            />
        </div>

        <div className="flex justify-between items-end">
            <div>
                <p className="text-xs uppercase opacity-80">Card Holder</p>
                <p className="font-semibold tracking-wider">{userData.displayName}</p>
            </div>
            <div className="flex items-center gap-2">
                 <p className="font-mono text-xs tracking-widest">{cardNumber}</p>
                 <Wifi size={24} className="-rotate-90" />
            </div>
        </div>
    </div>
  );
}
