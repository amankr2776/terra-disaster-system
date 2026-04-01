'use server';
/**
 * @fileOverview AI Commander Intelligence Flow.
 * 
 * Handles strategic generation of situation reports, resource allocation plans, 
 * and evacuation protocols based on real-time disaster context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligenceTypeSchema = z.enum(['report', 'allocation', 'evacuation']);

const CommanderIntelligenceInputSchema = z.object({
  type: IntelligenceTypeSchema.describe('The type of intelligence requested.'),
  weatherTelemetry: z.string().describe('Current live weather data (rainfall, wind, temp).'),
  activeZones: z.string().describe('Summary of active risk zones and their status.'),
  populationContext: z.string().describe('Information about at-risk citizens and shelter capacity.'),
});

export type CommanderIntelligenceInput = z.infer<typeof CommanderIntelligenceInputSchema>;

const CommanderIntelligenceOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  timestamp: z.string().optional(),
  impactAnalysis: z.object({
    affectedPopulation: z.number().describe('Total number of people in immediate risk zones.'),
    waterRequired: z.number().describe('Daily water requirement in liters (calculated based on population).'),
    foodRequired: z.number().describe('Daily food requirement in kilograms (calculated based on population).'),
    medicalResources: z.number().describe('Number of standard trauma/medical kits required.'),
  }),
  evacuationRoutes: z.array(z.string()).describe('List of recommended evacuation routes.'),
  timelinePrediction: z.array(z.object({
    time: z.string().describe('Time offset, e.g., T+2h'),
    event: z.string().describe('Predicted occurrence'),
    riskLevel: z.string().describe('Severity at that timestamp')
  })).describe('A short 3-step predictive timeline.')
});

export type CommanderIntelligenceOutput = z.infer<typeof CommanderIntelligenceOutputSchema>;

const intelligencePrompt = ai.definePrompt({
  name: 'commanderIntelligencePrompt',
  input: { schema: CommanderIntelligenceInputSchema },
  output: { schema: CommanderIntelligenceOutputSchema },
  prompt: `You are the TERRA Strategic AI Commander. 
Your role is to process real-time telemetry and generate critical tactical intelligence.

### Current Context:
- **Weather Telemetry:** {{{weatherTelemetry}}}
- **Active Zones:** {{{activeZones}}}
- **Population Context:** {{{populationContext}}}

### Request:
Generate a {{type}} for the current situation.

- If type is 'report': Provide a concise intelligence summary.
- If type is 'allocation': Detail specific resource deployment strategies.
- If type is 'evacuation': Create a structured protocol for citizen movement.

### Special Instructions for Calculations:
- Calculate Water Required: approx 3 Liters per person per day.
- Calculate Food Required: approx 2 Kilograms per person per day.
- Affected Population: Estimate based on the populationContext provided.

Tone: Professional, clinical, and high-fidelity command language.`,
});

export async function getCommanderIntelligence(input: CommanderIntelligenceInput): Promise<CommanderIntelligenceOutput> {
  const { output } = await intelligencePrompt(input);
  if (!output) throw new Error('AI failed to generate tactical intelligence');
  return {
    ...output,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
