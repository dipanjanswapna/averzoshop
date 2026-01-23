
'use client';

import { Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  className?: string;
}

export function ShareButtons({ url, className }: ShareButtonsProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied!' });
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')}
      >
        <Facebook size={16} />
      </Button>
      <Button
         variant="outline"
         size="icon"
        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')}
      >
        <Twitter size={16} />
      </Button>
       <Button
         variant="outline"
         size="icon"
        onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`, '_blank')}
      >
        <Linkedin size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
      >
        <Copy size={16} />
      </Button>
    </div>
  );
}
