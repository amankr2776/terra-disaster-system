"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "./SidebarNav"
import { Header } from "./Header"
import { SidebarProvider } from "@/components/ui/sidebar"

/**
 * Shell component handles conditional rendering of the main app layout.
 * It hides the sidebar and header on the landing page for a cinematic effect.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  // Landing page renders edge-to-edge without chrome
  if (isLandingPage) {
    return <main className="h-screen w-full overflow-hidden">{children}</main>
  }

  // All other pages render with standard tactical sidebar and header
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SidebarNav />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
