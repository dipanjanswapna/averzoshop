
'use client';

import { Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

interface ShareButtonsProps {
  url: string;
}

export function ShareButtons({ url }: ShareButtonsProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied!' });
  };

  return (
    <div className="absolute right-0 top-12 mt-2 w-48 bg-background border rounded-lg shadow-lg p-2 z-10 space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')}
      >
        <Facebook size={16} /> Facebook
      </Button>
      <Button
         variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')}
      >
        <Twitter size={16} /> Twitter
      </Button>
       <Button
         variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`, '_blank')}
      >
        <Linkedin size={16} /> LinkedIn
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={copyToClipboard}
      >
        <Copy size={16} /> Copy Link
      </Button>
    </div>
  );
}
