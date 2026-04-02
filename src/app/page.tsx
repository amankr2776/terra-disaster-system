import { LandingClient } from "./LandingClient"

export const metadata = {
  title: 'TERRA | Disaster Intelligence Platform',
  description: 'AI-powered real-time disaster intelligence and strategic response platform.',
}

/**
 * LandingPage - Server Component
 * Pre-renders the cinematic hero section and structural metadata.
 */
export default function LandingPage() {
  return (
    <div className="h-full">
      <LandingClient />
    </div>
  )
}
