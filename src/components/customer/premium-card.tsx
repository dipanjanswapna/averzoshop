
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserData } from '@/types/user';
import { Nfc } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardData = {
    cardNumber: `4021 **** **** ${userData.uid.substring(8, 12)}`,
    displayName: userData.displayName || "Not Set",
    memberSince: userData.createdAt?.toDate ? (userData.createdAt.toDate().getMonth() + 1).toString().padStart(2, '0') + '/' + userData.createdAt.toDate().getFullYear().toString().slice(-2) : "N/A",
    validThru: "12/28", // Placeholder
  };

  const tier = userData.membershipTier || 'silver';

  const tierStyles: any = {
    silver: {
      gradient: "from-slate-100 via-slate-200 to-slate-300",
      text: "text-slate-800",
      shadow: "shadow-slate-400/50",
      border: "border-slate-300"
    },
    gold: {
      gradient: "from-yellow-400 via-amber-500 to-yellow-600",
      text: "text-white",
      shadow: "shadow-amber-500/50",
      border: "border-amber-600"
    },
    platinum: {
      gradient: "from-slate-800 via-slate-900 to-black",
      text: "text-white",
      shadow: "shadow-slate-900/50",
      border: "border-slate-700"
    }
  };

  const s = tierStyles[tier];

  return (
    <div className="w-full max-w-sm mx-auto [perspective:2000px]">
      <motion.div
        className="relative w-full aspect-[1.586/1] [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE */}
        <div className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-6 flex flex-col justify-between cursor-pointer overflow-hidden bg-gradient-to-br ${s.gradient} ${s.text} border ${s.border} ${s.shadow}`}>
             {/* World Map Background */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
                <path fill="currentColor" d="M800 50C400 50 100 300 100 500s300 400 700 400 700-200 700-400S1200 50 800 50z" opacity=".1"/>
                <path fill="currentColor" d="M800,0C358.18,0,0,201.31,0,450S358.18,900,800,900s800-201.31,800-450S1241.82,0,800,0Zm0,850C386.59,850,50,672.34,50,450S386.59,50,800,50s750,177.66,750,400S1213.41,850,800,850Z"/>
                <path fill="currentColor" opacity="0.4" d="m203 543l-1-3l2-1l2 2z M454 227l-1-2l-1 2z M454 227l1 1l-1-1z M1444 388l-1 1l1-1z M1179 676l-1 2l1-2z M1065 678l-1-1l1 1z" />
            </svg>
            <div className="flex justify-between items-start z-10">
                <p className="text-2xl font-black italic tracking-tighter opacity-90">AVERZO<span className={cn(tier === 'platinum' ? 'text-blue-400' : 'text-blue-600')}>.</span></p>
                <div className="flex items-center gap-2">
                    <p className="font-bold text-xs uppercase tracking-widest opacity-80">{tier}</p>
                    <Nfc size={24} className="opacity-70" />
                </div>
            </div>

            <div className="space-y-1 z-10">
                <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center shadow-inner-lg border border-yellow-200/50">
                    <div className="w-10 h-6 bg-yellow-100 rounded-sm" />
                </div>
                <p className="font-mono text-xl tracking-wider opacity-90">{cardData.cardNumber}</p>
            </div>

            <div className="flex justify-between items-end z-10">
                <div>
                    <p className="text-[8px] font-bold uppercase opacity-60 tracking-widest">Card Holder</p>
                    <p className="text-sm font-bold tracking-widest uppercase">{cardData.displayName}</p>
                </div>
                 <div className="text-right">
                    <p className="text-[8px] font-bold uppercase opacity-60 tracking-widest">Member Since</p>
                    <p className="text-sm font-mono tracking-widest">{cardData.memberSince}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-bold uppercase opacity-60 tracking-widest">Valid Thru</p>
                    <p className="text-sm font-mono tracking-widest">{cardData.validThru}</p>
                </div>
            </div>
        </div>
        
        {/* BACK SIDE */}
        <div className={`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl flex flex-col cursor-pointer overflow-hidden bg-gradient-to-br ${s.gradient} ${textStyles[tier]} border ${s.border}`}>
            <div className="w-full h-12 bg-black mt-6" />
            <div className="flex items-center gap-4 px-6 mt-4">
                <div className="w-3/4 h-8 bg-white/80 rounded-md p-1 flex items-center justify-end">
                    <p className="text-right text-black font-mono italic text-sm pr-2">{userData.uid.substring(0, 3)}</p>
                </div>
                <div className="w-1/4 h-8 flex items-center justify-center font-mono text-sm">
                    {userData.uid.substring(3, 6)}
                </div>
            </div>
            <div className="px-6 mt-2 text-[6px] opacity-70 uppercase tracking-wider">
                Authorized Signature - Not valid unless signed
            </div>
             <div className="flex-1 flex flex-col justify-end items-center px-6 pb-4">
                 <div className="w-20 h-20 bg-gradient-to-br from-blue-400/50 via-purple-400/50 to-red-400/50 rounded-md animate-pulse p-1">
                     <div className="w-full h-full bg-white/20 backdrop-blur-sm" />
                </div>
                <p className="text-[8px] opacity-70 mt-1">Hologram Security</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
