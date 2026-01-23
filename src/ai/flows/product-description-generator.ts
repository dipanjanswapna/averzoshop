
'use server';

/**
 * @fileOverview Product description generator AI agent.
 *
 * - generateProductDescription - A function that generates product descriptions.
 * - ProductDescriptionInput - The input type for the generateProductDescription function.
 * - ProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product.'),
  keywords: z.string().describe('Keywords related to the product, separated by commas.'),
});

export type ProductDescriptionInput = z.infer<typeof ProductDescriptionInputSchema>;

const ProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});

export type ProductDescriptionOutput = z.infer<typeof ProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: ProductDescriptionInput
): Promise<ProductDescriptionOutput> {
  return productDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: ProductDescriptionInputSchema},
  output: {schema: ProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in e-commerce product descriptions.

  Generate an engaging and informative product description based on the following information:

  Product Name: {{{name}}}
  Category: {{{category}}}
  Keywords: {{{keywords}}}

  The description should be concise, highlighting the key features and benefits of the product.  Make it appealing to online shoppers.
  `,
});

const productDescriptionFlow = ai.defineFlow(
  {
    name: 'productDescriptionFlow',
    inputSchema: ProductDescriptionInputSchema,
    outputSchema: ProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

  