'use server';

/**
 * @fileOverview A flow to suggest similar items based on the current item list.
 *
 * - suggestSimilarItems - A function that suggests similar items.
 * - SuggestSimilarItemsInput - The input type for the suggestSimilarItems function.
 * - SuggestSimilarItemsOutput - The return type for the suggestSimilarItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarItemsInputSchema = z.object({
  items: z.array(z.string()).describe('The list of items to find similar items for.'),
});
export type SuggestSimilarItemsInput = z.infer<typeof SuggestSimilarItemsInputSchema>;

const SuggestSimilarItemsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested similar items.'),
});
export type SuggestSimilarItemsOutput = z.infer<typeof SuggestSimilarItemsOutputSchema>;

export async function suggestSimilarItems(input: SuggestSimilarItemsInput): Promise<SuggestSimilarItemsOutput> {
  return suggestSimilarItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarItemsPrompt',
  input: {schema: SuggestSimilarItemsInputSchema},
  output: {schema: SuggestSimilarItemsOutputSchema},
  prompt: `You are a helpful assistant that suggests similar items based on a list of items.

  Given the following list of items:
  {{#each items}}- {{{this}}}
  {{/each}}

  Suggest other items that are similar or related to the items in the list. Only suggest items that would be sold in a supermarket or convenience store. Return a maximum of 5 suggestions.
  Do not repeat items already in the list.
  Format your suggestions as a list.
  `,config: {
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

const suggestSimilarItemsFlow = ai.defineFlow(
  {
    name: 'suggestSimilarItemsFlow',
    inputSchema: SuggestSimilarItemsInputSchema,
    outputSchema: SuggestSimilarItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
