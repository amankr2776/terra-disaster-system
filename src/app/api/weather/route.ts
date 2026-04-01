import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lat = 19.0760;
    const lon = 72.8777;
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenWeather API Key is missing');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url, { next: { revalidate: 60 } });
    
    if (!response.ok) {
      throw new Error(`Weather API responded with ${response.status}`);
    }

    const data = await response.json();

    // OpenWeather provides wind speed in m/s when using units=metric. 
    // Convert m/s to km/h: 1 m/s * 3.6 = 1 km/h
    const windSpeedKmH = (data.wind.speed * 3.6).toFixed(1);
    
    // Rain info is optional in the response
    const rainfall = data.rain ? `${data.rain['1h'] || 0}mm/h` : "0mm/h";

    const weatherData = {
      timestamp: new Date().toISOString(),
      telemetry: {
        rainfall: rainfall,
        windSpeed: `${windSpeedKmH}km/h`,
        temperature: `${data.main.temp.toFixed(1)}°C`,
        humidity: `${data.main.humidity}%`,
        pressure: `${data.main.pressure} hPa`
      },
      status: "Live Satellite Feed"
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    return NextResponse.json({ 
      error: "Failed to sync with weather satellite",
      telemetry: {
        rainfall: "N/A",
        windSpeed: "N/A",
        temperature: "N/A"
      }
    }, { status: 500 });
  }
}
