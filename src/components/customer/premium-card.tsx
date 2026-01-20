
'use client';
import { UserData } from '@/types/user';
import { Wifi, Phone } from 'lucide-react';
import AverzoLogo from '../averzo-logo';
import Image from 'next/image';

export function PremiumCard({ userData }: { userData: UserData }) {

  const cardNumber = `AVZ-${userData.uid.substring(0, 4).toUpperCase()}-${userData.uid.substring(4, 8).toUpperCase()}-${userData.uid.substring(8, 12).toUpperCase()}`;

  const tierGradients = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-blue-400 to-blue-600',
  };
  const currentTier = userData.membershipTier || 'silver';

  return (
    <div className={`relative w-full max-w-lg h-60 text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${tierGradients[currentTier]}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"></div>
        
        <div className="flex justify-between items-start">
            <AverzoLogo className="text-white" />
            <div className="text-right">
                <p className="font-bold text-lg capitalize">{currentTier}</p>
                <p className="text-xs opacity-80">Membership</p>
            </div>
        </div>

        <div className="flex justify-between items-center">
            <div className='w-2/3'>
                 <p className="text-xs uppercase opacity-80">Card Holder</p>
                <p className="font-semibold tracking-wider text-lg truncate">{userData.displayName}</p>
                
                {userData.phone && (
                    <div className="flex items-center gap-2 mt-2">
                        <Phone size={12} />
                        <p className="font-mono text-xs">{userData.phone}</p>
                    </div>
                )}
                 <p className="font-mono text-xs tracking-wider mt-2">{cardNumber}</p>
            </div>
            <div className="w-1/3 flex flex-col items-center justify-center bg-white/90 p-2 rounded-lg">
                <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(userData.uid)}`}
                    alt="QR Code"
                    width={80}
                    height={80}
                />
                 <p className="text-[8px] font-bold text-black mt-1">SCAN ME</p>
            </div>
        </div>

        <div className="flex justify-end items-end">
             <div className="flex items-center gap-2">
                 <Wifi size={24} className="-rotate-90" />
            </div>
        </div>
    </div>
  );
}
