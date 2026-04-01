import { NextResponse } from 'next/server';
import { database, ref, get, set, push, serverTimestamp, query, limitToLast } from "@/lib/firebase";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { type } = await req.json();

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
    const systemPrompt = "You are TERRA's AI strategic commander. Analyze incoming disaster telemetry and produce structured tactical outputs. Be professional, concise, and clinical.";
    
    const userPrompt = `
    LIVE DISASTER DATA:
    Type: ${disaster.type || 'N/A'} | Severity: ${disaster.severity || 'N/A'}
    Location: ${disaster.sector || 'N/A'}
    Affected Population: ${disaster.affectedPopulation || 0}
    Evacuation Progress: ${disaster.evacuationPercent || 0}%
    
    WEATHER:
    Rainfall: ${weather.rainfall || 0}mm/hr | Wind: ${weather.windSpeed || 0}km/h | Temp: ${weather.temperature || 0}°C
    
    REQUEST TYPE: ${type.toUpperCase()}
    
    Generate a JSON response ONLY with:
    {
      "situationReport": "3-4 sentence summary of threat level and priorities",
      "evacuationPlan": "Step-by-step evacuation protocol for this sector",
      "resourceAllocation": "Specific breakdown of water, food, medical kits, and personnel needs",
      "impactAnalysis": {
        "affectedPopulation": number,
        "waterRequired": number,
        "foodRequired": number,
        "medicalResources": number
      },
      "timelinePrediction": [
        {"time": "T+1h", "event": "Event name", "riskLevel": "Level"}
      ],
      "aiNotification": "A single urgent notification for the tactical feed",
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

    // Merge new analysis with existing data to prevent data loss
    const currentAnalysisSnap = await get(analysisRef);
    const currentAnalysis = currentAnalysisSnap.val() || {};

    const updatedAnalysis = {
      ...currentAnalysis,
      ...aiResult,
      lastUpdated: serverTimestamp()
    };

    await Promise.all([
      set(analysisRef, updatedAnalysis),
      push(feedRef, {
        message: aiResult.aiNotification || `AI Intelligence Sync: ${type.toUpperCase()} updated.`,
        priority: aiResult.aiNotificationPriority || "INFO",
        timestamp: new Date().toISOString(),
        source: "ai"
      })
    ]);

    return NextResponse.json({ success: true, analysis: updatedAnalysis });
  } catch (error: any) {
    console.error('AI Analysis Pipeline Error:', error);
    return NextResponse.json({ error: error.message || "Intelligence sync failed" }, { status: 500 });
  }
}
