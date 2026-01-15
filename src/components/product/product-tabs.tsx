
'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from '@/types/product';
import { ProductReviews } from './product-reviews';
import { Button } from '../ui/button';
import { AskQuestionDialog } from './ask-question-dialog';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

const questionsAndAnswers = [
  {
    question: "Is this t-shirt true to size?",
    answer: "Yes, most customers find that it fits true to size. We recommend checking the size guide for exact measurements.",
  },
  {
    question: "What is the material composition?",
    answer: "This t-shirt is made of 100% premium combed cotton for a soft and comfortable feel.",
  }
];

export function ProductTabs({ product }: { product: Product }) {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
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
                {questionsAndAnswers.map((item, index) => (
                  <div key={index} className="border-b pb-4">
                    <p className="font-bold text-foreground">Q: {item.question}</p>
                    <p className="text-muted-foreground mt-1">A: {item.answer}</p>
                  </div>
                ))}
                 {questionsAndAnswers.length === 0 && <p className="text-muted-foreground text-center">No questions have been asked yet.</p>}
              </div>
              <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} />
            </TabsContent>
        </Tabs>
    );
}
