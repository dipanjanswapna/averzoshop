
'use client';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from '@/types/product';
import { ProductReviews } from './product-reviews';
import { Button } from '../ui/button';
import { AskQuestionDialog } from './ask-question-dialog';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, query, collection, orderBy } from 'firebase/firestore';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Question {
    id: string;
    questionText: string;
    answerText?: string;
    askedByName: string;
    createdAt: { toDate: () => Date } | null;
    answeredByUid?: string;
    answeredAt?: { toDate: () => Date };
}

export function ProductTabs({ product }: { product: Product }) {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const { user, userData, firestore } = useAuth();
  const { toast } = useToast();
  
  const questionsQuery = useMemo(() => {
    if (!firestore || !product?.id) return null;
    return query(collection(firestore, `products/${product.id}/questions`), orderBy('createdAt', 'desc'));
  }, [firestore, product?.id]);

  const { data: questions, isLoading: isLoadingQuestions } = useFirestoreQuery<Question>(questionsQuery);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleAnswerSubmit = async (questionId: string) => {
    const answerText = answers[questionId];
    if (!firestore || !user || !answerText || !answerText.trim()) {
        toast({ variant: 'destructive', title: 'Answer cannot be empty.' });
        return;
    }

    setIsSubmitting(questionId);
    const questionRef = doc(firestore, `products/${product.id}/questions`, questionId);
    
    try {
        await updateDoc(questionRef, {
            answerText,
            answeredByUid: user.uid,
            answeredAt: serverTimestamp(),
        });
        toast({ title: 'Answer submitted!' });
        setAnswers(prev => ({ ...prev, [questionId]: '' }));
    } catch (error) {
        console.error("Error submitting answer:", error);
        toast({ variant: 'destructive', title: 'Failed to submit answer.' });
    } finally {
        setIsSubmitting(null);
    }
  };

    return (
        <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start md:grid md:grid-cols-4 md:w-full overflow-x-auto whitespace-nowrap no-scrollbar">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6 text-sm text-muted-foreground prose max-w-none">
                <p>{product.description || "No description available for this product."}</p>
            </TabsContent>
            <TabsContent value="specifications" className="py-6 space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-4">Product Details</h4>
                  <Table className="text-sm">
                    <TableBody>
                      {product.brand && (
                        <TableRow>
                          <TableCell className="font-semibold text-foreground w-1/4">Brand</TableCell>
                          <TableCell className="text-muted-foreground">{product.brand}</TableCell>
                        </TableRow>
                      )}
                      {product.category && (
                        <TableRow>
                          <TableCell className="font-semibold text-foreground">Category</TableCell>
                          <TableCell className="text-muted-foreground">{product.category}</TableCell>
                        </TableRow>
                      )}
                      {product.group && (
                        <TableRow>
                          <TableCell className="font-semibold text-foreground">Group</TableCell>
                          <TableCell className="text-muted-foreground">{product.group}</TableCell>
                        </TableRow>
                      )}
                      {product.subcategory && (
                        <TableRow>
                          <TableCell className="font-semibold text-foreground">Subcategory</TableCell>
                          <TableCell className="text-muted-foreground">{product.subcategory}</TableCell>
                        </TableRow>
                      )}
                      {product.baseSku && (
                        <TableRow>
                          <TableCell className="font-semibold text-foreground">Base SKU</TableCell>
                          <TableCell className="text-muted-foreground">{product.baseSku}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg mb-4">Additional Specifications</h4>
                    <Table className="text-sm">
                      <TableBody>
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="font-semibold text-foreground capitalize w-1/4">{key.replace(/_/g, ' ')}</TableCell>
                            <TableCell className="text-muted-foreground">{String(value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
                <ProductReviews productId={product.id} />
            </TabsContent>
            <TabsContent value="qa" className="py-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsQuestionDialogOpen(true)}>Ask a Question</Button>
              </div>
              <div className="space-y-4">
                {isLoadingQuestions ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : questions && questions.length > 0 ? (
                    questions.map((item) => (
                        <div key={item.id} className="border-b pb-4">
                            <p className="font-bold text-foreground">Q: {item.questionText}</p>
                            <p className="text-xs text-muted-foreground">Asked by {item.askedByName} on {item.createdAt ? item.createdAt.toDate().toLocaleDateString() : '...'}</p>
                            
                            {item.answerText ? (
                                <div className="mt-2 pl-4 border-l-2 border-primary bg-muted/50 p-3 rounded-r-lg">
                                  <p className="font-bold text-sm">A: {item.answerText}</p>
                                  {item.answeredAt && (
                                    <p className="text-xs text-muted-foreground mt-1">Answered on {item.answeredAt.toDate().toLocaleDateString()}</p>
                                  )}
                                </div>
                            ) : (
                                userData?.role === 'admin' || userData?.uid === product.vendorId ? (
                                    <div className="mt-2 pl-4 space-y-2">
                                        <Textarea 
                                            placeholder="Write your answer..." 
                                            value={answers[item.id] || ''}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                                        />
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleAnswerSubmit(item.id)}
                                            disabled={isSubmitting === item.id || !(answers[item.id] || '').trim()}
                                        >
                                            {isSubmitting === item.id ? 'Submitting...' : 'Submit Answer'}
                                        </Button>
                                    </div>
                                ) : (
                                  <p className="text-muted-foreground mt-2 pl-4 text-sm">A: This question has not been answered yet.</p>
                                )
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">No questions have been asked yet. Be the first!</p>
                )}
              </div>
              <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} productId={product.id} />
            </TabsContent>
        </Tabs>
    );
}
