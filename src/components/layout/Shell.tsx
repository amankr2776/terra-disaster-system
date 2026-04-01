"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "./SidebarNav"
import { Header } from "./Header"
import { SidebarProvider } from "@/components/ui/sidebar"

/**
 * Shell component handles conditional rendering of the main app layout.
 * It hides the sidebar and header on the landing page for a cinematic effect.
 * Deferring layout rendering until after hydration to prevent mismatch.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by returning a stable base until the client pathname is known
  if (!mounted) {
    return <div className="bg-background min-h-screen" />
  }

  const isLandingPage = pathname === "/"

  // Landing page renders edge-to-edge without chrome
  if (isLandingPage) {
    return <main className="h-screen w-full overflow-hidden bg-black">{children}</main>
  }

  // All other pages render with standard tactical sidebar and header
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6 relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
