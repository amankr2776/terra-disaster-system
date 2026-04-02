import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const DB_URL = "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST() {
  try {
    // 1. Fetch live telemetry from Firebase via REST
    const [disasterRes, weatherRes] = await Promise.all([
      fetch(`${DB_URL}/terra/activeDisaster.json`),
      fetch(`${DB_URL}/terra/weatherData.json`)
    ]);

    const disaster = await disasterRes.json() || {};
    const weather = await weatherRes.json() || {};

    // 2. Build the Strategic Prediction Prompt
    const systemPrompt = "You are a TERRA disaster prediction AI. Analyze the provided telemetry and generate a structured 6-hour forecast. Be clinical, precise, and professional. Always respond with valid JSON only.";
    
    const userPrompt = `
    LIVE TELEMETRY:
    Active Disaster: ${disaster.type || 'Monitoring'} | Severity: ${disaster.severity || 'LOW'}
    Current Sector: ${disaster.sector || 'Global'}
    Affected Population: ${disaster.affectedPopulation || 0}
    Drainage Capacity: ${disaster.drainageCapacity || 100}%
    
    ATMOSPHERICS:
    Rainfall: ${weather.rainfall || 0}mm/h | Wind: ${weather.windSpeed || 0}km/h | Temp: ${weather.temperature || 0}°C
    
    Return ONLY this JSON structure:
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

    const raw = completion.choices[0]?.message?.content || "{}";
    const forecastData = JSON.parse(raw);

    // 4. Sync to Firebase via REST
    const updatedData = {
      ...forecastData,
      lastUpdated: new Date().toISOString()
    };
    
    await fetch(`${DB_URL}/terra/forecast.json`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
      headers: { "Content-Type": "application/json" }
    });

    return NextResponse.json(updatedData);
  } catch (error: any) {
    console.error('AI Forecast Pipeline Error:', error);
    return NextResponse.json({ error: "Neural projection failed" }, { status: 500 });
  }
}
