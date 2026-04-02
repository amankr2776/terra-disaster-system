"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "./SidebarNav"
import { Header } from "./Header"
import { SidebarProvider } from "@/components/ui/sidebar"

/**
 * Shell component handles conditional rendering of the main app layout.
 * Optimized for SSR by avoiding blocking returns before hydration.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isLandingPage = pathname === "/"

  // If we're on the landing page, render without standard sidebar/header chrome
  if (isLandingPage) {
    return (
      <main className="h-screen w-full overflow-hidden bg-black">
        {children}
      </main>
    )
  }

  // Tactical shell for all interior command pages
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
