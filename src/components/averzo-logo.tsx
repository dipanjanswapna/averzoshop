
import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const AverzoLogo = ({ className }: { className?: string }) => (
  <Link href="/" className={cn("group text-2xl font-black font-saira tracking-tighter", className)}>
    <span className="bg-gradient-to-r from-primary via-destructive to-pink-500 bg-clip-text text-transparent transition-all duration-300 group-hover:brightness-110">
      AVER<span className="lowercase">z</span>O.
    </span>
  </Link>
);

export default AverzoLogo;
