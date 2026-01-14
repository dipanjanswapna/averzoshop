import * as React from 'react';
import { cn } from '@/lib/utils';

const AverzoLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 25"
    className={cn('fill-current', className)}
  >
    <title>Averzo Logo</title>
    <text
      x="0"
      y="20"
      fontFamily="'Saira', sans-serif"
      fontSize="24"
      fontWeight="bold"
      className="text-foreground dark:text-sidebar-foreground"
    >
      Averzo
    </text>
  </svg>
);

export default AverzoLogo;
