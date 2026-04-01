
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock simulation state
  return NextResponse.json({
    active: true,
    elapsedTime: "T+12h",
    fidelity: "99.1%",
    currentStep: 4,
    totalSteps: 48,
    lastUpdate: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, city } = body;

  // Mock simulation control logic
  return NextResponse.json({
    status: "Success",
    message: `Simulation ${action} initiated for ${city}`,
    timestamp: new Date().toISOString()
  });
}
