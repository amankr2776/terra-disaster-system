
import { NextResponse } from 'next/server';
import { simulateDisasterScenario } from '@/ai/flows/simulate-disaster-scenario';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    // Call Genkit flow for AI processing
    const result = await simulateDisasterScenario({
      scenarioDescription: prompt || "Analyze standard coastal risk profile."
    });

    return NextResponse.json({
      status: "Neural Link Active",
      analysis: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Neural link failed" }, { status: 500 });
  }
}
