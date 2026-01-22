import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const AverzoLogo = ({ className }: { className?: string }) => (
  <Link href="/" className={cn("group text-3xl font-black font-saira tracking-tighter", className)}>
    <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent transition-all duration-300 group-hover:from-pink-600 group-hover:via-purple-600 group-hover:to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400">
      AVER<span className="lowercase">z</span>O
    </span>
    <span className="text-primary transition-all duration-300 group-hover:text-destructive">.</span>
  </Link>
);

export default AverzoLogo;
