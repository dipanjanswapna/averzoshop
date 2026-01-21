'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserData } from '@/types/user';
import { Nfc, Wifi, QrCode, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';
import { BarcodePopup } from './barcode-popup';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Helper function to format the UID into a card number format
const formatCardNumber = (uid: string) => {
    if (!uid) return '**** **** **** ****';
    const cleanUid = uid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16).toUpperCase();
    return cleanUid.match(/.{1,4}/g)?.join(' ') || '**** **** **** ****';
};

export function PremiumCard({ userData }: { userData: UserData }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isBarcodePopupOpen, setIsBarcodePopupOpen] = useState(false);
  const [isWritingNfc, setIsWritingNfc] = useState(false);
  const { toast } = useToast();

  // Dynamic card data generation
  const cardData = {
    cardNumber: formatCardNumber(userData.uid),
    cvv: userData.uid ? userData.uid.slice(-3) : 'XXX',
    displayName: userData.displayName || "Not Set",
    memberSince: userData.createdAt?.toDate ? (userData.createdAt.toDate().getMonth() + 1).toString().padStart(2, '0') + '/' + userData.createdAt.toDate().getFullYear().toString().slice(-2) : "N/A",
    validThru: userData.createdAt?.toDate ? `${(userData.createdAt.toDate().getMonth() + 1).toString().padStart(2, '0')}/${(userData.createdAt.toDate().getFullYear() + 4).toString().slice(-2)}` : "N/A",
  };

  const tier = userData.membershipTier || 'silver';

  const tierStyles: any = {
    silver: {
      gradient: "from-slate-200 via-gray-300 to-slate-200",
      text: "text-slate-800",
      hologram: "hologram-silver",
      border: "border-slate-300/50",
    },
    gold: {
      gradient: "from-yellow-400 via-amber-500 to-yellow-600",
      text: "text-white",
      hologram: "hologram-gold",
      border: "border-amber-400/50",
    },
    platinum: {
      gradient: "from-slate-800 via-slate-900 to-black",
      text: "text-white",
      hologram: "hologram-platinum",
      border: "border-slate-700",
    }
  };

  const s = tierStyles[tier];
  const barcodeColor = s.text.includes('white') ? '#FFFFFF' : '#1e293b';

  const handleBarcodeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the card from flipping back
    setIsBarcodePopupOpen(true);
  };
  
  const handleNfcWrite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('NDEFReader' in window)) {
        toast({
            variant: "destructive",
            title: "NFC Not Supported",
            description: "Your browser or device does not support Web NFC.",
        });
        return;
    }

    setIsWritingNfc(true);
    try {
        const ndef = new (window as any).NDEFReader();
        await ndef.write({
            records: [{ recordType: "text", data: userData.uid }]
        });
        toast({
            title: "NFC Tag Written!",
            description: "Your membership ID has been written to the NFC tag.",
        });
    } catch (error: any) {
        console.error("NFC write error:", error);
        toast({
            variant: "destructive",
            title: "NFC Write Failed",
            description: error.message || "Could not write to NFC tag. Please try again.",
        });
    } finally {
        setIsWritingNfc(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto [perspective:2000px] no-print">
        <motion.div
          className="relative w-full aspect-[1.586/1] [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* FRONT SIDE */}
          <div 
            className={cn(`absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl p-6 flex flex-col justify-between cursor-pointer overflow-hidden bg-gradient-to-br border`, s.gradient, s.text, s.border)} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
              <div className="flex justify-between items-start z-10">
                  <p className="text-2xl font-black italic tracking-tighter opacity-90">AVERZO<span className="text-blue-500">.</span></p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-current" onClick={(e) => { e.stopPropagation(); setIsBarcodePopupOpen(true); }}>
                      <QrCode />
                  </Button>
              </div>

              <div className="space-y-2 z-10">
                  <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center shadow-inner-lg border border-yellow-200/50">
                      <div className="w-8 h-5 bg-yellow-100 rounded-sm" />
                  </div>
                  <p className="font-mono text-xl tracking-wider opacity-90">{cardData.cardNumber}</p>
              </div>

              <div className="flex justify-between items-end z-10">
                  <div>
                      <p className="text-[7px] font-bold uppercase opacity-60 tracking-widest">Card Holder</p>
                      <p className="text-xs font-bold tracking-widest uppercase">{cardData.displayName}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[7px] font-bold uppercase opacity-60 tracking-widest">Member Since</p>
                      <p className="text-[10px] font-mono tracking-widest">{cardData.memberSince}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[7px] font-bold uppercase opacity-60 tracking-widest">Valid Thru</p>
                      <p className="text-[10px] font-mono tracking-widest">{cardData.validThru}</p>
                  </div>
              </div>
          </div>
          
          {/* BACK SIDE */}
          <div className={cn(`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl flex flex-col cursor-pointer overflow-hidden bg-gradient-to-br border`, s.gradient, s.text, s.border)} onClick={() => setIsFlipped(!isFlipped)}>
              <div className="w-full h-12 bg-black mt-6" />
              <div className="flex items-center gap-4 px-6 mt-4">
                  <div className="w-3/4 h-8 bg-white/80 rounded-md p-1 flex items-center justify-end shadow-inner">
                      <p className="text-right text-black font-mono italic text-sm pr-2">{cardData.cvv}</p>
                  </div>
                   <div 
                    className={cn("w-1/4 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all", s.hologram)}
                    onClick={handleNfcWrite}
                    title="Write to NFC Tag"
                  >
                      {isWritingNfc ? <Loader2 size={20} className="animate-spin" /> : <Nfc size={20} className="opacity-70" />}
                  </div>
              </div>
              <div className="px-6 mt-2 text-[6px] opacity-70 uppercase tracking-wider">
                  Authorized Signature - Not valid unless signed
              </div>
              <div className="flex-1 flex flex-col justify-center items-center px-6 cursor-pointer" onClick={handleBarcodeClick}>
                  <div className="bg-white p-1.5 rounded-md shadow-inner">
                      <Barcode value={userData.uid} height={20} width={0.8} displayValue={false} background="transparent" lineColor={barcodeColor} />
                  </div>
                  <p className="text-[7px] opacity-70 mt-1 font-mono">{userData.uid}</p>
              </div>
              <p className="text-center text-xs text-muted-foreground px-6 pb-4">
                  If found, please return to any Averzo outlet. This card is non-transferable.
              </p>
          </div>
        </motion.div>
      </div>
      <BarcodePopup
        open={isBarcodePopupOpen}
        onOpenChange={setIsBarcodePopupOpen}
        userName={userData.displayName || 'Member'}
        uid={userData.uid}
      />
    </>
  );
}
