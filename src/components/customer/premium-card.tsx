
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData } from '@/types/user';
import { Button } from '../ui/button';
import { Nfc } from 'lucide-react';
import { Zap } from 'lucide-react';

const Barcode = ({ color = "currentColor", height = "h-12", width = "w-full", opacity = "opacity-80" }) => (
    <div className={`flex items-center justify-center gap-[1.5px] ${height} ${width} ${opacity}`}>
      {[...Array(45)].map((_, i) => (
        <div 
          key={i} 
          className="h-full bg-current" 
          style={{ 
            width: i % 7 === 0 ? '3px' : i % 4 === 0 ? '1px' : '2px',
            backgroundColor: color 
          }} 
        />
      ))}
    </div>
  );

export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const tier = userData.membershipTier || 'silver';

  const cardData = {
    uid: `AZO-${userData.uid.substring(0, 4)}-${userData.uid.substring(4, 8)}-${userData.uid.substring(8, 12)}`,
    uid_raw: userData.uid,
    displayName: userData.displayName || "Not Set",
    points: (userData.loyaltyPoints || 0).toLocaleString(),
    validThru: "12/28", // Placeholder
    address: userData.addresses?.[0] ? `${userData.addresses[0].streetAddress}, ${userData.addresses[0].area}, ${userData.addresses[0].district}` : "Not Available",
    contact: userData.phone || "+880 17XX-XXXXXX",
    benefits: tier === 'platinum' ? ["Priority Support", "15% Cashback", "Lounge Access", "Fast Delivery"] : tier === 'gold' ? ["Priority Support", "10% Cashback", "Early Access"] : ["Standard Support", "5% Cashback"]
  };

  const tierStyles: any = {
    silver: {
      bg: 'bg-slate-100',
      text: 'text-slate-900',
      accent: 'bg-slate-200 text-slate-800',
      tag: 'Silver Loyalty',
      border: 'border-slate-300'
    },
    gold: {
      bg: 'bg-[#C5A021]',
      text: 'text-white',
      accent: 'bg-black/20 text-white',
      tag: 'Gold Excellence',
      border: 'border-[#B8860B]'
    },
    platinum: {
      bg: 'bg-slate-950',
      text: 'text-white',
      accent: 'bg-white/10 text-cyan-400',
      tag: 'Platinum Elite',
      border: 'border-white/10'
    }
  };

  const s = tierStyles[tier];

  return (
    <>
      <div className="w-full max-w-[380px] aspect-[1.586/1] group [perspective:2000px] mx-auto">
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* FRONT SIDE */}
          <div 
            className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-6 flex flex-col border cursor-pointer overflow-hidden ${s.bg} ${s.text} ${s.border}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="text-2xl font-black italic tracking-tighter">AZO<span className="text-blue-500">.</span></span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Loyalty Member</span>
              </div>
              <div className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${s.accent}`}>
                {s.tag}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-start z-10">
               <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Total Points</p>
                    <h3 className="text-3xl font-black tracking-tight leading-none">{cardData.points}</h3>
                  </div>
                  
                  {/* LARGER SCAN-READY BARCODE AREA */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopup(true);
                    }}
                    className={`w-[140px] cursor-pointer hover:scale-105 transition-transform p-3 rounded-xl border border-current/10 bg-white/5 backdrop-blur-sm shadow-lg`}
                  >
                    <Barcode height="h-10" width="w-full" opacity="opacity-100" color={tier === 'silver' ? '#1e293b' : 'white'} />
                    <p className="text-[7px] text-center mt-2 font-black uppercase tracking-[0.2em]">Scan Directly</p>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-end z-10 pt-3 border-t border-current/10">
              <div className="space-y-0.5">
                <p className="text-[7px] font-bold uppercase opacity-50 tracking-tighter">Card Holder</p>
                <p className="text-[12px] font-bold tracking-widest uppercase leading-tight">{cardData.displayName}</p>
                <p className="text-[9px] font-mono font-bold text-blue-500 tracking-wider">ID: {cardData.uid.replace('AZO-', '')}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[7px] font-bold uppercase opacity-50 tracking-tighter">Valid Thru</p>
                <p className="text-[11px] font-bold font-mono tracking-wider">{cardData.validThru}</p>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            className={`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${s.bg} ${s.text} ${s.border}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="h-8 flex justify-end items-center px-6">
               <div className="flex gap-1.5 opacity-30">
                 <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
               </div>
            </div>

            <div className="flex-1 px-4 pb-4 flex items-center justify-center">
              <div className="w-full h-full bg-white/5 border border-current/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[8px] uppercase font-black opacity-40 tracking-widest block mb-1">Registered Address</span>
                    <p className="text-[10px] leading-relaxed font-medium border-l-2 border-blue-500 pl-2">{cardData.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[7px] uppercase font-black opacity-40 tracking-widest block mb-0.5">Contact Support</span>
                      <span className="text-[10.5px] font-bold tracking-wider">{cardData.contact}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] uppercase font-black opacity-40 tracking-widest block mb-0.5">Security Code</span>
                      <span className="text-[10.5px] font-bold tracking-widest">{cardData.uid.split('-')[1]}-{cardData.uid.split('-')[2]}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-1.5">Elite Benefits</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cardData.benefits.slice(0, 4).map((b, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-current/10 text-[7px] font-bold border border-white/5 uppercase tracking-tighter">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-current/10">
                  <p className="text-[6.5px] font-medium leading-[1.3] opacity-40 uppercase tracking-tighter text-center">
                    This card is non-transferable and remains property of AZO. If found, please return to any authorized AZO outlet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barcode Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setShowPopup(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-slate-900" 
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-xl font-black tracking-tighter italic mb-6 uppercase">AZO Redeem</h4>
              <div className="w-full bg-slate-50 p-8 rounded-2xl border border-slate-100 mb-6 flex flex-col items-center">
                <Barcode color="#000000" height="h-24" />
                <p className="text-[10px] font-mono mt-4 tracking-[0.4em] text-slate-500 font-black">{cardData.uid_raw.replace(/-/g, '')}</p>
              </div>
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Point Holder</p>
                <p className="text-lg font-black uppercase tracking-widest leading-none mb-1">{cardData.displayName}</p>
                <p className="text-[11px] font-bold text-blue-600 uppercase">Redeem Code: {cardData.uid.replace('AZO-', '')}</p>
              </div>
              <button onClick={() => setShowPopup(false)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-slate-200">Close Panel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
