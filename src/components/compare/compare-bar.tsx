
'use client';

import { useState } from 'react';
import { useCompare } from '@/hooks/use-compare';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Layers } from 'lucide-react';
import Image from 'next/image';
import { CompareDialog } from './compare-dialog';

export function CompareBar() {
  const { items, removeItem } = useCompare();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-foreground text-background p-3 rounded-xl shadow-2xl z-50 flex items-center gap-4"
      >
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
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
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="text-sm font-medium ml-2">
            Comparing {items.length} item{items.length > 1 ? 's' : ''}
          </div>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={items.length < 2}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
        >
          Compare Now <ArrowRight size={16} className="ml-2" />
        </Button>
      </motion.div>
      <CompareDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
