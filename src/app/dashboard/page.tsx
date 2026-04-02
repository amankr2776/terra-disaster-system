import { DashboardClient } from "./DashboardClient"

export const metadata = {
  title: 'TERRA | Command Center',
  description: 'Authority command center for real-time disaster monitoring and strategic response',
}

/**
 * DashboardPage - Server Component
 * Pre-renders the tactical structural shell and metadata.
 */
export default function DashboardPage() {
  return (
    <div className="h-full">
      <DashboardClient />
    </div>
  )
}
