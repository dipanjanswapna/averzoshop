'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating stock replenishment recommendations.
 *
 * - getReplenishmentPlan - A function that analyzes sales and inventory data to suggest reorder quantities.
 * - ReplenishmentPlannerInput - The input type for the getReplenishmentPlan function.
 * - ReplenishmentPlannerOutput - The return type for the getReplenishmentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReplenishmentPlannerInputSchema = z.object({
  outletId: z.string().describe('The ID of the outlet for which to generate the plan.'),
  inventoryJson: z.string().describe("A JSON string of the current inventory for the outlet. Each item includes productId, productName, variantSku, and currentStock."),
  salesDataJson: z.string().describe("A JSON string of sales data for the last 30 days for this outlet. Each sale item includes productId, variantSku, quantity, and saleDate."),
});
export type ReplenishmentPlannerInput = z.infer<typeof ReplenishmentPlannerInputSchema>;

const ReplenishmentPlannerOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      variantSku: z.string(),
      currentStock: z.number(),
      thirtyDaySales: z.number(),
      recommendedQuantity: z.number().describe('The suggested quantity to reorder.'),
      reasoning: z.string().describe('A brief explanation for the recommendation (e.g., "High sales velocity, stock will deplete in X days.").'),
    })
  ).describe('An array of replenishment recommendations for low-stock items.'),
});
export type ReplenishmentPlannerOutput = z.infer<typeof ReplenishmentPlannerOutputSchema>;

export async function getReplenishmentPlan(input: ReplenishmentPlannerInput): Promise<ReplenishmentPlannerOutput> {
  return replenishmentPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'replenishmentPlannerPrompt',
  input: {schema: ReplenishmentPlannerInputSchema},
  output: {schema: ReplenishmentPlannerOutputSchema},
  prompt: `You are an expert inventory management AI for a retail business.
Your task is to analyze the provided inventory and sales data for a specific outlet and recommend replenishment quantities for items that are running low on stock.

- The low stock threshold is 20 units. Any item with stock at or below this level should be considered for replenishment.
- Analyze the sales data from the last 30 days to determine the sales velocity of each item.
- Your goal is to recommend a reorder quantity that will cover at least the next 30-45 days of sales, while considering the current stock.
- A simple heuristic for reordering could be: (Average Daily Sales * 45) - Current Stock.
- Provide a brief, clear reasoning for each recommendation.
- Only provide recommendations for items that are low on stock.

Outlet ID: {{{outletId}}}

Current Inventory Data (JSON):
{{{inventoryJson}}}

Last 30 Days Sales Data (JSON):
{{{salesDataJson}}}

Based on this data, generate the replenishment plan.
`,
});

const replenishmentPlannerFlow = ai.defineFlow(
  {
    name: 'replenishmentPlannerFlow',
    inputSchema: ReplenishmentPlannerInputSchema,
    outputSchema: ReplenishmentPlannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
