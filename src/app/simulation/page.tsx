import { SimulationClient } from "./SimulationClient"

export const metadata = {
  title: 'TERRA | Disaster Simulation',
  description: 'Simulate flood, fire, cyclone and earthquake scenarios on a real-time city map',
}

/**
 * SimulationPage - Server Component
 * Renders the static structural shell and metadata for the simulation module.
 */
export default function SimulationPage() {
  return (
    <div className="relative h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] -m-6 overflow-hidden">
      {/* 
        The SimulationClient handles the high-fidelity map interactions and state management.
        The wrapper container renders on the server for immediate layout stability.
      */}
      <SimulationClient />
    </div>
  )
}
