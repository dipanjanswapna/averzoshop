
'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { products } from '@/lib/data';
import { ProductReviews } from './product-reviews';
import { Button } from '../ui/button';
import { AskQuestionDialog } from './ask-question-dialog';

type Product = (typeof products)[0];

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
                <p>This is a detailed description of the {product.name}. It's a high-quality product from {product.brand}, perfect for your needs. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </TabsContent>
            <TabsContent value="specifications" className="py-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong className="text-foreground w-24 inline-block">Category:</strong> {product.category}</li>
                    <li><strong className="text-foreground w-24 inline-block">Group:</strong> {product.group}</li>
                    <li><strong className="text-foreground w-24 inline-block">Brand:</strong> {product.brand}</li>
                    {product.colors.length > 0 && <li><strong className="text-foreground w-24 inline-block">Colors:</strong> {product.colors.join(', ')}</li>}
                    {product.sizes.length > 0 && <li><strong className="text-foreground w-24 inline-block">Sizes:</strong> {product.sizes.join(', ')}</li>}
                </ul>
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
