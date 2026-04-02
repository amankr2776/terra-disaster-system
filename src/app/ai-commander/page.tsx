import { AICommanderClient } from "./AICommanderClient"

export const metadata = {
  title: 'TERRA | AI Commander',
  description: 'AI-powered disaster response commander with real-time situation analysis and resource allocation',
}

/**
 * AICommanderPage - Server Component
 * Renders the static structural shell and metadata for the AI Commander module.
 */
export default function AICommanderPage() {
  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 
        The AICommanderClient handles the high-bandwidth neural link, 
        real-time Firebase listeners, and interactive tactical analysis.
      */}
      <AICommanderClient />
    </div>
  )
}
