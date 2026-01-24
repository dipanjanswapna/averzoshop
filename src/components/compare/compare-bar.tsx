'use client';

import { useState } from 'react';
import { useCompare } from '@/hooks/use-compare';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Layers } from 'lucide-react';
import Image from 'next/image';
import { CompareDialog } from './compare-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function CompareBar() {
  const { items, removeItem, clearCompare } = useCompare();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn(
        "fixed bottom-20 lg:bottom-4 z-[60] left-1/2 -translate-x-1/2 w-auto pointer-events-none"
      )}>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            "pointer-events-auto max-w-[95vw] bg-foreground text-background p-2 pr-1 rounded-xl shadow-2xl flex items-center gap-2"
          )}
        >
          <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar pl-2">
            <Layers className="text-primary flex-shrink-0" />
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="relative group flex-shrink-0"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-background/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="text-sm font-medium ml-2 flex-shrink-0">
              {items.length} item{items.length > 1 ? 's' : ''}
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            disabled={items.length < 2}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 h-10 text-xs px-3"
          >
            Compare
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCompare}
            className="h-8 w-8 rounded-full flex-shrink-0 hover:bg-white/20"
            aria-label="Clear compare list"
          >
            <X size={16} />
          </Button>
        </motion.div>
      </div>
      <CompareDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
