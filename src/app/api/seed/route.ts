import { NextResponse } from "next/server"

const DB_URL = "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app"

export async function GET() {
  try {
    const data = {
      activeDisaster: {
        type: "flood",
        severity: "CRITICAL",
        sector: "Sector 4, Mumbai",
        affectedPopulation: 842500,
        evacuationPercent: 42,
        drainageCapacity: 94,
        minutesToInundation: 22,
        lastUpdated: new Date().toISOString()
      },
      weatherData: {
        rainfall: 18,
        windSpeed: 34,
        temperature: 29
      },
      tacticalFeed: {
        entry1: {
          message: "Levee breach confirmed at Sector 4 North",
          priority: "CRITICAL",
          source: "authority",
          timestamp: new Date().toISOString()
        },
        entry2: {
          message: "Strike Team Bravo deployed to Marine Drive",
          priority: "INFO",
          source: "authority",
          timestamp: new Date().toISOString()
        },
        entry3: {
          message: "High tide synchronization detected. Coastal risk +20%",
          priority: "WARNING",
          source: "authority",
          timestamp: new Date().toISOString()
        }
      },
      reliefCamps: {
        camp1: { name: "City Central School", distance: "0.8", capacityPercent: 80 },
        camp2: { name: "Community Hall B", distance: "1.5", capacityPercent: 45 },
        camp3: { name: "Sports Arena North", distance: "2.2", capacityPercent: 100 }
      },
      evacRoutes: {
        route1: { name: "GST Road Exit", status: "clear" },
        route2: { name: "Highway 17 North", status: "clear" }
      },
      settings: {
        simulationSpeed: 1,
        rainfallThreshold: 15,
        criticalBroadcaster: true,
        satelliteFidelity: true,
        primarySector: "Sector 4, Mumbai"
      }
    }

    const res = await fetch(`${DB_URL}/terra.json`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })

    if (!res.ok) throw new Error(`Firebase REST error: ${res.status}`)

    return NextResponse.json({ success: true, message: "Firebase seeded successfully" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}