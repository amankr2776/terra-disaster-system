import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Defaulting to Mumbai coordinates for the primary sector
    const lat = 19.0760;
    const lon = 72.8777;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure&timezone=auto`;

    const response = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 mins
    const data = await response.json();

    const weatherData = {
      timestamp: new Date().toISOString(),
      telemetry: {
        rainfall: `${data.current.precipitation}mm/h`,
        windSpeed: `${data.current.wind_speed_10m}km/h`,
        temperature: `${data.current.temperature_2m}°C`,
        humidity: `${data.current.relative_humidity_2m}%`,
        pressure: `${data.current.surface_pressure} hPa`
      },
      status: "Live Satellite Feed"
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    return NextResponse.json({ error: "Failed to sync with weather satellite" }, { status: 500 });
  }
}
