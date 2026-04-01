import { NextResponse } from 'next/server';
import { database, ref, get, set, serverTimestamp } from "@/lib/firebase";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST() {
  try {
    // 1. Fetch live telemetry from Firebase
    const [disasterSnap, weatherSnap] = await Promise.all([
      get(ref(database, 'terra/activeDisaster')),
      get(ref(database, 'terra/weatherData'))
    ]);

    const disaster = disasterSnap.val() || {};
    const weather = weatherSnap.val() || {};

    // 2. Build the Strategic Prediction Prompt
    const systemPrompt = "You are a TERRA disaster prediction AI. Analyze the provided telemetry and generate a structured 6-hour forecast. Be clinical, precise, and professional.";
    
    const userPrompt = `
    LIVE TELEMETRY:
    Active Disaster: ${disaster.type || 'Monitoring'} | Severity: ${disaster.severity || 'LOW'}
    Current Sector: ${disaster.sector || 'Global'}
    Affected Population: ${disaster.affectedPopulation || 0}
    Drainage Capacity: ${disaster.drainageCapacity || 100}%
    
    ATMOSPHERICS:
    Rainfall: ${weather.rainfall || 0}mm/h | Wind: ${weather.windSpeed || 0}km/h | Temp: ${weather.temperature || 0}°C
    
    Generate a JSON response ONLY with:
    {
      "summary": "Detailed 3-4 sentence predictive summary",
      "modelFidelity": 98.4,
      "primaryRisk": "Name of the biggest threat",
      "targetZone": "Most at-risk sub-sector",
      "immediateAction": "The single most important tactical directive",
      "hourlyForecast": [
        { 
          "hour": "Now", 
          "severity": "Low|Warning|High|Critical", 
          "rainfall": number, 
          "temperature": number, 
          "predictedSeverityPercent": number,
          "windSpeed": number,
          "drainageLoad": number,
          "evacuationUrgency": "LOW|MODERATE|HIGH|CRITICAL"
        },
        { "hour": "+1hr", ... },
        { "hour": "+2hr", ... },
        { "hour": "+3hr", ... },
        { "hour": "+4hr", ... },
        { "hour": "+6hr", ... }
      ]
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

    const forecastData = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 4. Sync to Firebase
    const forecastRef = ref(database, 'terra/forecast');
    const updatedData = {
      ...forecastData,
      lastUpdated: serverTimestamp()
    };
    
    await set(forecastRef, updatedData);

    return NextResponse.json(updatedData);
  } catch (error: any) {
    console.error('AI Forecast Pipeline Error:', error);
    return NextResponse.json({ error: "Neural projection failed" }, { status: 500 });
  }
}
