'use server';
/**
 * @fileOverview Product recommender AI agent.
 *
 * - getRecommendedProducts - A function that generates product recommendations based on a user's wishlist.
 * - ProductRecommenderInput - The input type for the getRecommendedProducts function.
 * - ProductRecommenderOutput - The return type for the getRecommendedProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/types/product';

const ProductRecommenderInputSchema = z.object({
  allProductsJson: z.string().describe("A JSON string of all available products. Each product should at least have id, name, category, group, subcategory, description, and total_stock."),
  wishlistProductsJson: z.string().describe("A JSON string of products from the user's wishlist. Each product should at least have id, name, category, group, subcategory, and description."),
});
export type ProductRecommenderInput = z.infer<typeof ProductRecommenderInputSchema>;

const ProductRecommenderOutputSchema = z.object({
  recommendedProductIds: z.array(z.string()).describe('An array of recommended product IDs, up to 6.'),
});
export type ProductRecommenderOutput = z.infer<typeof ProductRecommenderOutputSchema>;

export async function getRecommendedProducts(input: ProductRecommenderInput): Promise<ProductRecommenderOutput> {
  return productRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommenderPrompt',
  input: {schema: ProductRecommenderInputSchema},
  output: {schema: ProductRecommenderOutputSchema},
  prompt: `You are an expert e-commerce product recommender. Your task is to analyze a user's wishlist and recommend similar products from a list of all available products.

Analyze the user's taste based on the products in their wishlist:
User's Wishlist:
{{{wishlistProductsJson}}}

Now, from the list of all available products below, select up to 6 products that the user might also like.
Do not recommend products that are already in the user's wishlist.
Prioritize products that are in stock (total_stock > 0).

All Available Products:
{{{allProductsJson}}}

Return only the IDs of the recommended products.
`,
});

const productRecommenderFlow = ai.defineFlow(
  {
    name: 'productRecommenderFlow',
    inputSchema: ProductRecommenderInputSchema,
    outputSchema: ProductRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
