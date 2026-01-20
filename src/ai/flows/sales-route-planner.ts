'use server';

/**
 * @fileOverview This file defines a Genkit flow for planning optimized sales routes.
 *
 * - planSalesRepRoute - A function that takes a sales rep's starting point and a list of customers to visit, and returns an optimized route.
 * - SalesRoutePlannerInput - The input type for the planSalesRepRoute function.
 * - SalesRoutePlannerOutput - The return type for the planSalesRepRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesRoutePlannerInputSchema = z.object({
  startLocation: z.string().describe("The starting address or location of the sales representative."),
  customerLocations: z.string().describe("A JSON string representing an array of customer objects. Each object should contain at least a 'name' and 'address' property."),
});
export type SalesRoutePlannerInput = z.infer<typeof SalesRoutePlannerInputSchema>;

const SalesRoutePlannerOutputSchema = z.object({
  optimizedRoute: z.array(
    z.object({
      customerName: z.string().describe("The name of the customer to visit."),
      address: z.string().describe("The address of the customer."),
      step: z.number().describe("The step number in the optimized route, starting from 1."),
    })
  ).describe("An ordered array of stops for the sales representative's daily route."),
});
export type SalesRoutePlannerOutput = z.infer<typeof SalesRoutePlannerOutputSchema>;

export async function planSalesRepRoute(input: SalesRoutePlannerInput): Promise<SalesRoutePlannerOutput> {
  return salesRoutePlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesRoutePlannerPrompt',
  input: {schema: SalesRoutePlannerInputSchema},
  output: {schema: SalesRoutePlannerOutputSchema},
  prompt: `You are an expert logistics and route planning AI. Your task is to create the most efficient daily route for a sales representative.

You are given a starting location and a list of customer locations to visit.

Analyze the locations and create a step-by-step route that minimizes travel time and distance. The output should be an ordered list of customer visits.

Starting Location: {{{startLocation}}}

Customer Locations (JSON):
{{{customerLocations}}}

Generate the optimized route plan.
`,
});

const salesRoutePlannerFlow = ai.defineFlow(
  {
    name: 'salesRoutePlannerFlow',
    inputSchema: SalesRoutePlannerInputSchema,
    outputSchema: SalesRoutePlannerOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.customerLocations);
    } catch (e) {
        throw new Error("customerLocations must be a valid JSON string.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
