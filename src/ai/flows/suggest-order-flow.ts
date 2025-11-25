'use server';

/**
 * @fileOverview A flow to suggest a full order based on past order history.
 *
 * - suggestOrder - A function that suggests an order.
 * - SuggestOrderInput - The input type for the suggestOrder function.
 * - SuggestOrderOutput - The return type for the suggestOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PastOrderItemSchema = z.object({
    name: z.string().describe('The name of the item.'),
    quantity: z.number().describe('The quantity of the item ordered.'),
});

const PastOrderSchema = z.object({
    date: z.string().describe('The ISO date string of when the order was made.'),
    items: z.array(PastOrderItemSchema).describe('The items in the order.'),
});

const SuggestOrderInputSchema = z.object({
  pastOrders: z.array(PastOrderSchema).describe('A list of past orders, from most recent to oldest.'),
});
export type SuggestOrderInput = z.infer<typeof SuggestOrderInputSchema>;


const SuggestedItemSchema = z.object({
    name: z.string().describe('The name of the suggested item.'),
    quantity: z.number().describe('The suggested quantity for the item.'),
});
const SuggestOrderOutputSchema = z.object({
  suggestedOrder: z.array(SuggestedItemSchema).describe('A list of suggested items and their quantities for the new order.'),
});
export type SuggestOrderOutput = z.infer<typeof SuggestOrderOutputSchema>;

export async function suggestOrder(input: SuggestOrderInput): Promise<SuggestOrderOutput> {
  return suggestOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOrderPrompt',
  input: {schema: SuggestOrderInputSchema},
  output: {schema: SuggestOrderOutputSchema},
  prompt: `You are an expert inventory management assistant for a convenience store.
Your task is to predict the next order based on the store's past order history.
Analyze the trends, frequency, and quantities from the provided past orders.
The list of past orders is sorted from most recent to oldest.

Analyze the following past orders:
{{#each pastOrders}}
Order from {{date}}:
  {{#each items}}
  - {{name}}: {{quantity}}
  {{/each}}
{{/each}}

Based on this history, create a suggested order list.
Consider which items are ordered frequently and which are ordered in large quantities.
Pay attention to recent trends. For example, if an item's quantity has been increasing in recent orders, you might suggest ordering more of it.
Generate a list of items and quantities for the next order.
Do not suggest items that are not present in the past orders.
Return a list of suggested items and quantities.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestOrderFlow = ai.defineFlow(
  {
    name: 'suggestOrderFlow',
    inputSchema: SuggestOrderInputSchema,
    outputSchema: SuggestOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
