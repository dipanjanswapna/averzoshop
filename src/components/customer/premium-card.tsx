'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData } from '@/types/user';
import { Button } from '../ui/button';
import { Nfc } from 'lucide-react';
import Barcode from 'react-barcode';
import AverzoLogo from '../averzo-logo';

export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const tier = userData.membershipTier || 'silver';

  const cardData = {
    uid: `AZO-${userData.uid.substring(0, 4)}-${userData.uid.substring(4, 8)}-${userData.uid.substring(8, 12)}`,
    uid_raw: userData.uid,
    displayName: userData.displayName || "Not Set",
    memberSince: "01/24", // Placeholder
    validThru: "12/28", // Placeholder
    contact: userData.phone || "+880 17XX-XXXXXX",
  };
  
  const tierStyles = {
    silver: {
      bg: 'bg-gradient-to-br from-slate-200 to-slate-50',
      text: 'text-slate-800',
      accent: 'bg-slate-900 text-white',
      border: 'border-slate-300',
      chip: 'text-slate-500',
      hologram: 'bg-slate-300',
    },
    gold: {
      bg: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500',
      text: 'text-black',
      accent: 'bg-black/80 text-white',
      border: 'border-yellow-600/50',
      chip: 'text-yellow-900/70',
      hologram: 'bg-yellow-400',
    },
    platinum: {
      bg: 'bg-gradient-to-br from-slate-900 to-slate-700',
      text: 'text-white',
      accent: 'bg-white/10 text-cyan-400',
      border: 'border-white/10',
      chip: 'text-slate-400',
      hologram: 'bg-cyan-400',
    }
  };

  const s = tierStyles[tier];

  return (
    <>
      <div className="w-full max-w-[380px] aspect-[85.6/54] group [perspective:2000px] mx-auto">
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* FRONT SIDE */}
          <div 
            className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-5 flex flex-col border cursor-pointer overflow-hidden ${s.bg} ${s.text} ${s.border}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
             <div className="absolute inset-0 bg-grid-slate-100/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>
            <div className="flex justify-between items-start z-10">
              <AverzoLogo className="text-xl" />
              <Nfc size={28} className={s.chip} />
            </div>

            <div className="flex-1 flex flex-col justify-end items-start z-10">
               <p className="font-mono text-xl md:text-2xl tracking-widest font-bold opacity-80">{cardData.uid.split('-').slice(1).join(' ')}</p>
               <div className="flex items-end justify-between w-full mt-2">
                 <div className="space-y-0">
                    <p className="text-[8px] font-bold uppercase opacity-50 tracking-wider">Card Holder</p>
                    <p className="text-[14px] font-bold tracking-wider uppercase leading-tight">{cardData.displayName}</p>
                 </div>
                 <div className="text-right space-y-0">
                    <p className="text-[8px] font-bold uppercase opacity-50 tracking-wider">Member Since</p>
                    <p className="text-[12px] font-bold font-mono">{cardData.memberSince}</p>
                 </div>
                  <div className="text-right space-y-0">
                    <p className="text-[8px] font-bold uppercase opacity-50 tracking-wider">Valid Thru</p>
                    <p className="text-[12px] font-bold font-mono">{cardData.validThru}</p>
                 </div>
               </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            className={`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${s.bg} ${s.text} ${s.border}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="w-full h-12 bg-black mt-6"></div>
            <div className="flex items-center justify-between px-6 py-2 gap-4">
              <div className="w-3/4 h-8 bg-slate-200 rounded flex items-center justify-end pr-2 italic text-slate-900 font-bold text-lg">
                {cardData.uid.split('-').pop()}
              </div>
              <div 
                className={`w-8 h-8 rounded-full opacity-60 bg-gradient-to-br from-red-500 via-yellow-300 to-cyan-400 ${s.hologram}`}
                style={{
                    background: `linear-gradient(45deg, ${s.hologram}, #ff2525, #ffe53b, #25c9ff, ${s.hologram})`,
                    backgroundSize: '400% 400%',
                    animation: 'hologram 4s ease infinite',
                }}
              />
            </div>
            
            <div className="flex-1 px-6 pb-4 flex flex-col justify-end">
               <div className="w-full" onClick={(e) => {e.stopPropagation(); setShowPopup(true); }}>
                  <Barcode value={cardData.uid_raw} height={40} width={1.8} displayValue={false} background="transparent" lineColor={tier === 'silver' ? '#1e293b' : 'white'} margin={0}/>
               </div>
                <p className="text-[8px] leading-tight opacity-60 mt-4 text-center">
                    This card is non-transferable and remains property of AVERZO. If found, please return to any authorized AVERZO outlet. Contact: {cardData.contact}
                </p>
            </div>
          </div>
        </motion.div>
      </div>

       {/* Barcode Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setShowPopup(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-slate-900" 
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-bold tracking-tighter mb-4">Averzo Member ID</h4>
              <div className="w-full bg-slate-50 p-6 rounded-lg border border-slate-100 mb-4 flex flex-col items-center">
                <Barcode value={cardData.uid_raw} height={60} />
              </div>
              <div className="text-center mb-4">
                <p className="text-sm font-bold uppercase tracking-wider">{cardData.displayName}</p>
              </div>
              <Button onClick={() => setShowPopup(false)} className="w-full">Close</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}