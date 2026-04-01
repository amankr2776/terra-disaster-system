'use server';
/**
 * @fileOverview This file implements an AI-powered flow to generate a structured 6-hour disaster forecast.
 *
 * - generateDisasterForecast - A function that handles the generation of a disaster forecast.
 * - GenerateDisasterForecastInput - The input type for the generateDisasterForecast function.
 * - GenerateDisasterForecastOutput - The return type for the generateDisasterForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDisasterForecastInputSchema = z.object({
  regionDescription: z
    .string()
    .describe('A detailed description of the region for which the forecast is being generated.'),
  currentWeatherPatterns: z
    .string()
    .describe('Summary of current weather patterns and conditions (e.g., heavy rainfall, drought).'),
  historicalWeatherData: z
    .string()
    .describe('Summary of historical weather data relevant to disaster risks in the region.'),
  currentSeismicActivity: z
    .string()
    .describe('Summary of recent seismic activity (e.g., tremors, earthquake magnitudes).'),
  historicalSeismicData: z
    .string()
    .describe('Summary of historical seismic data and past earthquake events in the region.'),
  currentGeographicConditions: z
    .string()
    .describe(
      'Description of current geographic conditions (e.g., soil saturation levels, wildfire risk indices, river levels).'
    ),
  historicalDisasterEvents: z
    .string()
    .describe('Summary of past disaster events in the region, including types, impacts, and frequency.'),
});
export type GenerateDisasterForecastInput = z.infer<
  typeof GenerateDisasterForecastInputSchema
>;

const TimelineEntrySchema = z.object({
  label: z.string().describe("Time label, e.g., '+1hr'"),
  rainfall: z.string().describe("Predicted rainfall amount with unit"),
  severity: z.number().min(0).max(100).describe("Severity percentage"),
  risk: z.enum(['Low', 'Warning', 'High', 'Critical']).describe("Risk level"),
  temp: z.string().describe("Predicted temperature with unit")
});

const GenerateDisasterForecastOutputSchema = z.object({
  summary: z.string().describe('A natural language forecast summarizing potential disaster risks, likely affected regions, and estimated immediate resource needs.'),
  timeline: z.array(TimelineEntrySchema).length(6).describe("A 6-hour predictive vector for the next 6 hours.")
});

export type GenerateDisasterForecastOutput = z.infer<
  typeof GenerateDisasterForecastOutputSchema
>;

export async function generateDisasterForecast(
  input: GenerateDisasterForecastInput
): Promise<GenerateDisasterForecastOutput> {
  return generateDisasterForecastFlow(input);
}

const forecastPrompt = ai.definePrompt({
  name: 'disasterForecastPrompt',
  input: {schema: GenerateDisasterForecastInputSchema},
  output: {schema: GenerateDisasterForecastOutputSchema},
  prompt: `You are an AI assistant specialized in disaster intelligence and forecasting.
Your task is to analyze the provided current and historical data to generate a comprehensive 6-hour disaster forecast.

### Region Description:
{{{regionDescription}}}

### Current Data Context:
- Weather: {{{currentWeatherPatterns}}}
- Seismic: {{{currentSeismicActivity}}}
- Geography: {{{currentGeographicConditions}}}

### Historical Context:
- Weather: {{{historicalWeatherData}}}
- Seismic: {{{historicalSeismicData}}}
- Events: {{{historicalDisasterEvents}}}

Generate:
1. A concise natural language summary of the overall risk.
2. A structured timeline for the next 6 hours (labels: +1hr, +2hr, +3hr, +4hr, +5hr, +6hr).

Ensure the severity and risk levels reflect a logical progression based on the provided patterns.`,
});

const generateDisasterForecastFlow = ai.defineFlow(
  {
    name: 'generateDisasterForecastFlow',
    inputSchema: GenerateDisasterForecastInputSchema,
    outputSchema: GenerateDisasterForecastOutputSchema,
  },
  async input => {
    const {output} = await forecastPrompt(input);
    return output!;
  }
);
