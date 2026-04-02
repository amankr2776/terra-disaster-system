import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    if (!lat || !lon) {
      return NextResponse.json({ error: "No coordinates provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenWeather API Key missing" }, { status: 500 })
    }

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    )
    
    if (!res.ok) {
      throw new Error(`Weather API responded with ${res.status}`);
    }

    const data = await res.json()

    return NextResponse.json({
      rainfall: data.rain?.["1h"] || 0,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // m/s to km/h
      temperature: Math.round(data.main?.temp || 0),
      location: data.name,
      country: data.sys?.country,
      description: data.weather?.[0]?.description,
      humidity: data.main?.humidity,
      feelsLike: Math.round(data.main?.feels_like || 0)
    })
  } catch (error: any) {
    console.error("API Weather Route Error:", error);
    return NextResponse.json({ error: "Failed to sync with weather satellite" }, { status: 500 })
  }
}