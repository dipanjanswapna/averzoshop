import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const AverzoLogo = ({ className }: { className?: string }) => (
  <Link href="/" className={cn("text-3xl font-black font-saira tracking-tighter text-foreground", className)}>
    AVERZO<span className="text-primary">.</span>
  </Link>
);

export default AverzoLogo;
