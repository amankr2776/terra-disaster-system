import { NextResponse } from "next/server"
import Groq from "groq-sdk"

const DB_URL = "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST() {
  try {
    // Read from Firebase REST API
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

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are TERRA's AI disaster intelligence engine. Analyze incoming real-time disaster data and produce structured tactical outputs. Always respond with valid JSON only, no markdown, no extra text."
        },
        {
          role: "user",
          content: `
LIVE DISASTER DATA:
Type: ${disaster?.type} | Severity: ${disaster?.severity}
Location: ${disaster?.sector}
Affected Population: ${disaster?.affectedPopulation}
Evacuation Progress: ${disaster?.evacuationPercent}%
Infrastructure Capacity: ${disaster?.drainageCapacity}%
Time to Critical: ${disaster?.minutesToInundation} min

WEATHER:
Rainfall: ${weather?.rainfall}mm/hr | Wind: ${weather?.windSpeed}km/h | Temp: ${weather?.temperature}°C

RECENT NOTIFICATIONS:
${feedEntries}

Return ONLY this JSON:
{
  "situationReport": "3-4 sentence tactical summary",
  "evacuationPlan": "step by step evacuation instructions",
  "resourceAllocation": "water/food/medical/personnel breakdown",
  "aiNotification": "one urgent alert message for the tactical feed",
  "aiNotificationPriority": "CRITICAL",
  "confidence": 94.2
}`
        }
      ]
    })

    const raw = completion.choices[0].message.content || ""
    const clean = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)

    // Write analysis back to Firebase REST API
    await fetch(`${DB_URL}/terra/aiAnalysis.json`, {
      method: "PUT",
      body: JSON.stringify({ ...parsed, lastUpdated: new Date().toISOString() }),
      headers: { "Content-Type": "application/json" }
    })

    // Push AI notification to tacticalFeed
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}