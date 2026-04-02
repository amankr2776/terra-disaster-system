import { ForecastClient } from "./ForecastClient"

export const metadata = {
  title: 'TERRA | Forecast Projection',
  description: '6-hour predictive disaster forecast using real-time weather data and AI analysis',
}

export default function ForecastPage() {
  return <ForecastClient />
}
