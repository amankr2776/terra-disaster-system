import { NextResponse } from "next/server"
import Groq from "groq-sdk"

const DB_URL = "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST() {
  try {
    // 1. Fetch live telemetry from Firebase via REST
    const [disasterRes, weatherRes, feedRes] = await Promise.all([
      fetch(`${DB_URL}/terra/activeDisaster.json`),
      fetch(`${DB_URL}/terra/weatherData.json`),
      fetch(`${DB_URL}/terra/tacticalFeed.json`)
    ])

    const disaster = await disasterRes.json()
    const weather = await weatherRes.json()
    const feedRaw = await feedRes.json()

    const feedEntries = feedRaw
      ? Object.values(feedRaw).slice(-5).map((e: any) => e.message).join("\n")
      : "No recent entries"

    // 2. Define disaster-specific logic
    const disasterPrompts: Record<string, string> = {
      flood: `Focus on: drainage capacity, water levels, inundation spread, boat rescue deployment, pumping station status, low-lying area evacuation.`,
      cyclone: `Focus on: wind speed vectors, storm surge prediction, coastal evacuation corridors, shelter reinforcement, power grid protection.`,
      earthquake: `Focus on: aftershock probability, structural collapse zones, search and rescue grid, hospital capacity, utility line ruptures.`,
      drought: `Focus on: water reservoir levels, crop failure zones, cattle migration, drinking water distribution routes, fire risk.`,
      tsunami: `Focus on: wave arrival time, coastal inundation zones, vertical evacuation points, harbor closures, early warning status.`
    }

    const disasterContext = disasterPrompts[disaster?.type?.toLowerCase()] || 
      "Focus on general emergency response and population safety."

    // 3. Build the Strategic Neural Prompt
    const prompt = `
    You are TERRA's AI disaster intelligence engine analyzing a LIVE emergency.

    CURRENT DISASTER:
    Type: ${disaster?.type?.toUpperCase()}
    Severity: ${disaster?.severity}
    Active Sector: ${disaster?.sector}
    Affected Population: ${disaster?.affectedPopulation?.toLocaleString()} civilians
    Evacuation Progress: ${disaster?.evacuationPercent}%
    Infrastructure Capacity: ${disaster?.drainageCapacity}%
    Time to Critical Threshold: ${disaster?.minutesToInundation} minutes

    LIVE WEATHER AT ${disaster?.sector}:
    Rainfall: ${weather?.rainfall}mm/hr
    Wind Speed: ${weather?.windSpeed}km/h  
    Temperature: ${weather?.temperature}°C
    Humidity: ${weather?.humidity || 'N/A'}%

    RECENT AUTHORITY NOTIFICATIONS:
    ${feedEntries}

    DISASTER-SPECIFIC FOCUS:
    ${disasterContext}

    Generate a tactical response specific to ${disaster?.type} in ${disaster?.sector}.
    Return ONLY this JSON (no markdown, no extra text):
    {
      "situationReport": "4-5 sentence tactical summary specific to ${disaster?.type} in ${disaster?.sector}. Include specific street names, infrastructure, and population zones from the sector.",
      "evacuationPlan": "Step-by-step evacuation plan for ${disaster?.sector} specific to ${disaster?.type} disaster. Include specific routes, transport modes, priority zones.",
      "resourceAllocation": {
        "water": "X litres for Y days for ${disaster?.affectedPopulation} people",
        "food": "X ration packs",
        "medicalKits": "X kits prioritizing Z injuries common in ${disaster?.type}",
        "personnel": "X rescue workers, Y medical staff, Z coordinators",
        "specialEquipment": "Equipment specific to ${disaster?.type}"
      },
      "aiNotification": "One urgent sector-specific alert for ${disaster?.sector}",
      "aiNotificationPriority": "CRITICAL",
      "confidence": 94.2,
      "evacuationRoutes": [
        { "name": "Route name", "direction": "direction", "status": "clear" }
      ],
      "estimatedResponseTime": "X hours",
      "immediateActions": ["action1", "action2", "action3"]
    }`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })

    const raw = completion.choices[0].message.content || "{}"
    const parsed = JSON.parse(raw)

    // 4. Write analysis back to Firebase REST API
    const updatedAnalysis = { 
      ...parsed, 
      lastUpdated: new Date().toISOString(),
      affectedPopulation: disaster?.affectedPopulation || 0
    }
    
    await fetch(`${DB_URL}/terra/aiAnalysis.json`, {
      method: "PUT",
      body: JSON.stringify(updatedAnalysis),
      headers: { "Content-Type": "application/json" }
    })

    // 5. Push AI notification to tacticalFeed
    await fetch(`${DB_URL}/terra/tacticalFeed.json`, {
      method: "POST",
      body: JSON.stringify({
        message: parsed.aiNotification,
        priority: parsed.aiNotificationPriority,
        source: "ai",
        timestamp: new Date().toISOString()
      }),
      headers: { "Content-Type": "application/json" }
    })

    return NextResponse.json({ success: true, data: parsed })
  } catch (error: any) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
