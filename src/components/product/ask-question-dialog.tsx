
'use client';

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

interface AskQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskQuestionDialog({ open, onOpenChange }: AskQuestionDialogProps) {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Question Submitted!",
            description: "Your question has been submitted and will be answered shortly.",
        });
        onOpenChange(false);
    }
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
                <Textarea placeholder="Type your question here." id="question" required />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Submit Question</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
