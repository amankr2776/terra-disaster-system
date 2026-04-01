import { NextResponse } from 'next/server';
import { database, ref, get, set, push, serverTimestamp, query, limitToLast } from "@/lib/firebase";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST() {
  try {
    // 1. Fetch Tactical Data from Firebase
    const [disasterSnap, weatherSnap, feedSnap] = await Promise.all([
      get(ref(database, 'terra/activeDisaster')),
      get(ref(database, 'terra/weatherData')),
      get(query(ref(database, 'terra/tacticalFeed'), limitToLast(5)))
    ]);

    const disaster = disasterSnap.val() || {};
    const weather = weatherSnap.val() || {};
    const feed = feedSnap.val() || {};

    // Format feed messages for the prompt
    const feedMessages = Object.values(feed)
      .map((m: any) => `[${m.priority}] ${m.message}`)
      .join('\n');

    // 2. Build Tactical Prompt
    const systemPrompt = "You are TERRA's AI disaster intelligence engine. Analyze incoming real-time disaster data and produce structured tactical outputs for emergency commanders.";
    
    const userPrompt = `
    LIVE DISASTER DATA:
    Type: ${disaster.type || 'N/A'} | Severity: ${disaster.severity || 'N/A'}
    Location: ${disaster.sector || 'N/A'}
    Affected Population: ${disaster.affectedPopulation || 0}
    Evacuation Progress: ${disaster.evacuationPercent || 0}%
    Infrastructure Capacity: ${disaster.drainageCapacity || 0}%
    Time to Critical: ${disaster.minutesToInundation || 'Unknown'} min
    
    WEATHER:
    Rainfall: ${weather.rainfall || 0}mm/hr | Wind: ${weather.windSpeed || 0}km/h | Temp: ${weather.temperature || 0}°C
    
    RECENT AUTHORITY NOTIFICATIONS:
    ${feedMessages || 'No recent notifications.'}
    
    Generate a JSON response ONLY (no markdown, no extra text) with:
    {
      "situationReport": "3-4 sentence tactical summary",
      "evacuationPlan": "step by step evacuation instructions",
      "resourceAllocation": "water/food/medical/personnel breakdown",
      "impactAnalysis": {
        "affectedPopulation": number,
        "waterRequired": number,
        "foodRequired": number,
        "medicalResources": number
      },
      "timelinePrediction": [
        {"time": "T+Xh", "event": "Occurrence", "riskLevel": "Severity"}
      ],
      "aiNotification": "one urgent alert message for the tactical feed",
      "aiNotificationPriority": "CRITICAL|WARNING|INFO",
      "confidence": 94.2
    }`;

    // 3. Call Groq Intelligence
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 4. Update Firebase with Intelligence
    const analysisRef = ref(database, 'terra/aiAnalysis');
    const feedRef = ref(database, 'terra/tacticalFeed');

    await Promise.all([
      // Save full analysis
      set(analysisRef, {
        ...aiResult,
        lastUpdated: serverTimestamp()
      }),
      // Push AI notification to feed
      push(feedRef, {
        message: aiResult.aiNotification || "AI intelligence updated.",
        priority: aiResult.aiNotificationPriority || "INFO",
        timestamp: new Date().toISOString(),
        source: "ai"
      })
    ]);

    return NextResponse.json({ success: true, analysis: aiResult });
  } catch (error) {
    console.error('AI Analysis Pipeline Error:', error);
    return NextResponse.json({ error: "Intelligence sync failed" }, { status: 500 });
  }
}
