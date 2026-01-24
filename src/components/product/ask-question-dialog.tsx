'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AskQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export function AskQuestionDialog({ open, onOpenChange, productId }: AskQuestionDialogProps) {
  const { toast } = useToast();
  const { user, firestore } = useAuth();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You must be logged in to ask a question.',
      });
      return;
    }
    if (!question.trim()) {
        toast({ variant: 'destructive', title: 'Question cannot be empty.' });
        return;
    }

    setIsLoading(true);
    try {
      const questionsRef = collection(firestore, `products/${productId}/questions`);
      await addDoc(questionsRef, {
        productId,
        questionText: question,
        askedByUid: user.uid,
        askedByName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        answers: [],
      });

      toast({
        title: "Question Submitted!",
        description: "Your question has been submitted and will be answered shortly.",
      });
      setQuestion('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your question. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Have a question about this product? Ask the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                placeholder="Type your question here."
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
