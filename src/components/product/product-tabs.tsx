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
import { doc, updateDoc, serverTimestamp, query, collection, orderBy, arrayUnion } from 'firebase/firestore';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types/order';
import { Badge } from '../ui/badge';
import { Check, Shield } from 'lucide-react';

interface Answer {
    answerText: string;
    answeredByUid: string;
    answeredByName: string;
    answeredByRole: 'customer' | 'admin' | 'vendor' | 'outlet' | 'rider';
    answeredAt: { toDate: () => Date };
}

interface Question {
    id: string;
    questionText: string;
    askedByName: string;
    createdAt: { toDate: () => Date } | null;
    answers?: Answer[];
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
  const { data: userOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(user ? query(collection(firestore, 'orders'), where('customerId', '==', user.uid)) : null);

  const canAnswer = useMemo(() => {
    if (!user || !userOrders) return false;
    return userOrders.some(order => 
        (order.status === 'delivered' || order.status === 'fulfilled') &&
        order.items.some(item => item.productId === product.id)
    );
  }, [user, userOrders, product.id]);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleAnswerSubmit = async (questionId: string) => {
    const answerText = answers[questionId];
    if (!firestore || !user || !userData || !answerText || !answerText.trim()) {
        toast({ variant: 'destructive', title: 'Answer cannot be empty.' });
        return;
    }

    setIsSubmitting(questionId);
    const questionRef = doc(firestore, `products/${product.id}/questions`, questionId);
    
    try {
        const newAnswer = {
            answerText,
            answeredByUid: user.uid,
            answeredByName: user.displayName || 'Anonymous',
            answeredByRole: userData.role,
            answeredAt: new Date(),
        };

        await updateDoc(questionRef, {
            answers: arrayUnion(newAnswer),
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
                        <div key={item.id} className="border-t pt-4">
                            <p className="font-bold text-foreground">Q: {item.questionText}</p>
                            <p className="text-xs text-muted-foreground">Asked by {item.askedByName} on {item.createdAt ? item.createdAt.toDate().toLocaleDateString() : '...'}</p>
                            
                            {item.answers && item.answers.length > 0 ? (
                                <div className="mt-3 space-y-3">
                                  {item.answers.sort((a,b) => b.answeredAt.toDate().getTime() - a.answeredAt.toDate().getTime()).map((answer, index) => (
                                    <div key={index} className="pl-4 border-l-2 border-primary/50 bg-muted/30 p-3 rounded-r-lg">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <p className="font-bold text-sm text-foreground">{answer.answeredByName}</p>
                                          {(answer.answeredByRole === 'admin' || (answer.answeredByRole === 'vendor' && answer.answeredByUid === product.vendorId)) && (
                                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs gap-1">
                                                  <Shield size={12} /> Official
                                              </Badge>
                                          )}
                                          {answer.answeredByRole === 'customer' && (
                                              <Badge variant="outline" className="gap-1"><Check size={12} /> Verified Buyer</Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{answer.answeredAt.toDate().toLocaleDateString()}</p>
                                      </div>
                                      <p className="text-sm mt-1">{answer.answerText}</p>
                                    </div>
                                  ))}
                                </div>
                            ) : (
                                  <p className="text-muted-foreground mt-2 pl-4 text-sm">No answers yet.</p>
                            )}

                            {(canAnswer || userData?.role === 'admin' || userData?.uid === product.vendorId) && (
                                <div className="mt-4 pl-4 space-y-2">
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
