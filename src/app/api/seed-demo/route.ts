
import { NextResponse } from 'next/server';
import { database, ref, set, push } from "@/lib/firebase";

export async function POST() {
  try {
    const timestamp = Date.now();

    // 1. Seed Active Disaster
    await set(ref(database, 'terra/activeDisaster'), {
      type: "flood",
      severity: "CRITICAL",
      sector: "Sector 4, Mumbai",
      affectedPopulation: 842500,
      evacuationPercent: 42,
      drainageCapacity: 94,
      minutesToInundation: 22,
      lastUpdated: timestamp
    });

    // 2. Seed Weather Data
    await set(ref(database, 'terra/weatherData'), {
      rainfall: 12.5,
      windSpeed: 45,
      temperature: 28,
      lastUpdated: timestamp
    });

    // 3. Seed Relief Camps
    await set(ref(database, 'terra/reliefCamps'), {
      camp1: { name: "City Central School", distance: "0.8", capacityPercent: 80 },
      camp2: { name: "North Stadium", distance: "2.1", capacityPercent: 100 },
      camp3: { name: "West Parish Hall", distance: "1.5", capacityPercent: 45 }
    });

    // 4. Seed Evacuation Routes
    await set(ref(database, 'terra/evacRoutes'), {
      route1: { name: "Expressway East", status: "clear" },
      route2: { name: "Coastal Link Road", status: "blocked" }
    });

    // 5. Seed Initial Tactical Feed
    const feedRef = ref(database, 'terra/tacticalFeed');
    const initialMessages = [
      { message: "Neural Surveillance Grid Online", priority: "INFO", source: "authority", timestamp: new Date(timestamp - 300000).toISOString() },
      { message: "High water velocity detected at Sector 4 Levee", priority: "WARNING", source: "authority", timestamp: new Date(timestamp - 200000).toISOString() },
      { message: "CRITICAL: Levee breach confirmed at Sector 4 North", priority: "CRITICAL", source: "authority", timestamp: new Date(timestamp - 100000).toISOString() },
      { message: "AI Analysis: Immediate evacuation of low-lying areas recommended", priority: "CRITICAL", source: "ai", timestamp: new Date(timestamp - 50000).toISOString() },
      { message: "Relief Camp 'North Stadium' at maximum capacity", priority: "WARNING", source: "authority", timestamp: new Date().toISOString() }
    ];

    for (const msg of initialMessages) {
      await push(feedRef, msg);
    }

    return NextResponse.json({ success: true, message: "Mumbai Flood Demo Seeded" });
  } catch (error) {
    console.error('Seeding Error:', error);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
