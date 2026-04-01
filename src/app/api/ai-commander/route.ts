
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { type, context } = await req.json();

    let systemPrompt = "";
    if (type === 'report') {
      systemPrompt = "You are a disaster intelligence AI. Generate a concise tactical situation report for a flooding event in Mumbai's Sector 4. Include threat level, affected population estimate, and top 3 priorities.";
    } else if (type === 'evacuation') {
      systemPrompt = "You are a disaster response commander. Generate an evacuation plan for 800,000+ civilians in coastal Mumbai during a critical flood. Include route priorities, transport needs, and timeline.";
    } else if (type === 'allocation') {
      systemPrompt = "You are a logistics AI for disaster response. Generate a resource allocation plan for a major flood affecting 842,500 people. Include water, food, medical kits, and personnel estimates.";
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${systemPrompt} 
          Output MUST be a JSON object with the following structure:
          {
            "title": "Short tactical title",
            "content": "Detailed natural language response",
            "priority": "Low|Medium|High|Critical",
            "impactAnalysis": {
              "affectedPopulation": number,
              "waterRequired": number,
              "foodRequired": number,
              "medicalResources": number
            },
            "evacuationRoutes": ["Route A", "Route B"],
            "timelinePrediction": [
              {"time": "T+Xh", "event": "Occurrence", "riskLevel": "Severity"}
            ]
          }`
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(context)}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseContent || "{}"));
  } catch (error) {
    console.error('Groq AI Commander Error:', error);
    return NextResponse.json({ error: "Failed to communicate with AI Brain" }, { status: 500 });
  }
}
