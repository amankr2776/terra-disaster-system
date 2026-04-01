
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock forecast summary
  return NextResponse.json({
    region: "Bangalore Sector",
    primaryRisk: "Urban Flash Flooding",
    riskLevel: "Critical",
    timeframe: "6-Hour Horizon",
    confidence: "94%",
    timeline: [
      { label: "Now", rain: "8.2mm", severity: 45 },
      { label: "+1hr", rain: "15.4mm", severity: 82 },
      { label: "+2hr", rain: "20.1mm", severity: 94 }
    ]
  });
}
