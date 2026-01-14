'use server';

/**
 * @fileOverview This file defines a Genkit flow for monitoring active deliveries,
 * identifying potential delays, and alerting admins to issues.
 *
 * - deliveryMonitoringDashboard - A function that monitors active deliveries and identifies potential issues.
 * - DeliveryMonitoringDashboardInput - The input type for the deliveryMonitoringDashboard function.
 * - DeliveryMonitoringDashboardOutput - The return type for the deliveryMonitoringDashboard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeliveryMonitoringDashboardInputSchema = z.object({
  activeDeliveries: z.string().describe('A JSON string containing an array of active delivery objects, each including deliveryId, expectedDeliveryTime, currentStatus, and customerId.'),
});
export type DeliveryMonitoringDashboardInput = z.infer<typeof DeliveryMonitoringDashboardInputSchema>;

const DeliveryMonitoringDashboardOutputSchema = z.object({
  alerts: z.array(
    z.object({
      deliveryId: z.string().describe('The ID of the delivery with a potential issue.'),
      issue: z.string().describe('A description of the potential issue (e.g., delay, incorrect address).'),
      suggestedAction: z.string().describe('A suggested action to resolve the issue (e.g., contact customer, reroute delivery).'),
    })
  ).describe('An array of alerts for deliveries with potential issues.'),
});
export type DeliveryMonitoringDashboardOutput = z.infer<typeof DeliveryMonitoringDashboardOutputSchema>;

export async function deliveryMonitoringDashboard(input: DeliveryMonitoringDashboardInput): Promise<DeliveryMonitoringDashboardOutput> {
  return deliveryMonitoringDashboardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deliveryMonitoringDashboardPrompt',
  input: {schema: DeliveryMonitoringDashboardInputSchema},
  output: {schema: DeliveryMonitoringDashboardOutputSchema},
  prompt: `You are an AI assistant that monitors active deliveries and identifies potential issues.

You are provided with a JSON string containing an array of active delivery objects.
Each delivery object has the following properties:
- deliveryId: The unique identifier for the delivery.
- expectedDeliveryTime: The expected delivery time in ISO format.
- currentStatus: The current status of the delivery (e.g., enRoute, atWarehouse, delayed).
- customerId: The unique identifier for the customer.

Your task is to analyze the active deliveries and identify any potential issues that may cause delays or other problems.
Generate alerts for deliveries that require attention.
Each alert should include the deliveryId, a description of the issue, and a suggested action to resolve the issue.

Ensure that the alerts are concise and actionable.

Active Deliveries:
{{activeDeliveries}}`,
});

const deliveryMonitoringDashboardFlow = ai.defineFlow(
  {
    name: 'deliveryMonitoringDashboardFlow',
    inputSchema: DeliveryMonitoringDashboardInputSchema,
    outputSchema: DeliveryMonitoringDashboardOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.activeDeliveries);
    } catch (e) {
      throw new Error('activeDeliveries is not a valid JSON string.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
