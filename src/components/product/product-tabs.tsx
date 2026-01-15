
'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from '@/types/product';
import { ProductReviews } from './product-reviews';
import { Button } from '../ui/button';
import { AskQuestionDialog } from './ask-question-dialog';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '../ui/skeleton';

interface Question {
    id: string;
    questionText: string;
    answerText?: string;
    askedByName: string;
    createdAt: { toDate: () => Date };
}

export function ProductTabs({ product }: { product: Product }) {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const { data: questions, isLoading: isLoadingQuestions } = useFirestoreQuery<Question>(`products/${product.id}/questions`);

    return (
        <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start md:grid md:grid-cols-4 md:w-full overflow-x-auto whitespace-nowrap no-scrollbar">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="qa">Q&A</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6 text-sm text-muted-foreground prose max-w-none">
                <p>{product.description || "No description available for this product."}</p>
            </TabsContent>
            <TabsContent value="specifications" className="py-6">
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
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
                <ProductReviews />
            </TabsContent>
            <TabsContent value="qa" className="py-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsQuestionDialogOpen(true)}>Ask a Question</Button>
              </div>
              <div className="space-y-4">
                {isLoadingQuestions ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : questions && questions.length > 0 ? (
                    questions.map((item) => (
                        <div key={item.id} className="border-b pb-4">
                            <p className="font-bold text-foreground">Q: {item.questionText}</p>
                            <p className="text-xs text-muted-foreground">Asked by {item.askedByName} on {item.createdAt.toDate().toLocaleDateString()}</p>
                            {item.answerText ? (
                                <p className="text-muted-foreground mt-2 pl-4 border-l-2 border-primary">A: {item.answerText}</p>
                            ) : (
                                <p className="text-muted-foreground mt-2 pl-4 text-sm">A: This question has not been answered yet.</p>
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
