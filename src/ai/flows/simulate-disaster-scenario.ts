'use server';
/**
 * @fileOverview A Genkit flow for simulating disaster scenarios and generating potential impacts and initial response considerations.
 *
 * - simulateDisasterScenario - A function that simulates a disaster scenario.
 * - SimulateDisasterScenarioInput - The input type for the simulateDisasterScenario function.
 * - SimulateDisasterScenarioOutput - The return type for the simulateDisasterScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateDisasterScenarioInputSchema = z.object({
  scenarioDescription: z.string().describe('A natural language description of the disaster scenario to simulate.'),
});
export type SimulateDisasterScenarioInput = z.infer<typeof SimulateDisasterScenarioInputSchema>;

const SimulateDisasterScenarioOutputSchema = z.object({
  potentialImpacts: z.string().describe('A detailed summary of the potential impacts of the disaster scenario, including effects on population, infrastructure, and environment.'),
  responseConsiderations: z.string().describe('A detailed summary of initial response considerations, including immediate actions, resource needs, and communication strategies.'),
});
export type SimulateDisasterScenarioOutput = z.infer<typeof SimulateDisasterScenarioOutputSchema>;

export async function simulateDisasterScenario(input: SimulateDisasterScenarioInput): Promise<SimulateDisasterScenarioOutput> {
  return simulateDisasterScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateDisasterScenarioPrompt',
  input: {schema: SimulateDisasterScenarioInputSchema},
  output: {schema: SimulateDisasterScenarioOutputSchema},
  prompt: `You are an expert disaster management professional and an AI assistant specializing in scenario simulation.
Your task is to analyze a given disaster scenario and provide a comprehensive assessment of its potential impacts and initial response considerations.

Based on the following disaster scenario description, generate a detailed summary of potential impacts and initial response considerations.

Disaster Scenario: {{{scenarioDescription}}}

Provide the output in JSON format, strictly following the schema.`,
});

const simulateDisasterScenarioFlow = ai.defineFlow(
  {
    name: 'simulateDisasterScenarioFlow',
    inputSchema: SimulateDisasterScenarioInputSchema,
    outputSchema: SimulateDisasterScenarioOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
