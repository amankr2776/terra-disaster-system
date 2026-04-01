
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock resource inventory
  return NextResponse.json([
    { name: "Ambulances", available: 42, deployed: 18, status: "Active" },
    { name: "Helicopters", available: 5, deployed: 7, status: "Limited" },
    { name: "Rescue Teams", available: 24, deployed: 16, status: "Optimal" },
    { name: "Relief Camps", available: 8, deployed: 17, status: "Warning" }
  ]);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { resourceId, status } = body;

  // Mock deployment update
  return NextResponse.json({
    status: "Updated",
    resourceId,
    newStatus: status,
    timestamp: new Date().toISOString()
  });
}
