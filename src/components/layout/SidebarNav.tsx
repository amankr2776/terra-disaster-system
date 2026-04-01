"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Settings, 
  Package,
  Layers,
  UserCircle,
  Lock,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { database, ref, onValue } from "@/lib/firebase"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Simulation", href: "/simulation", icon: Zap },
  { name: "AI Commander", href: "/ai-commander", icon: ShieldAlert },
  { name: "Forecast Timeline", href: "/forecast", icon: Activity },
  { name: "Resources", href: "/resources", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [health, setHealth] = useState<number | null>(null)
  const [healthBreakdown, setHealthBreakdown] = useState({
    firebase: 0,
    ai: 0,
    data: 0
  })

  useEffect(() => {
    let isConnected = false
    let lastAiAnalysis = 0
    let activeDisasterExists = false

    // Function defined at top of scope to ensure proper hoisting within useEffect
    function calculateHealth() {
      let firebaseScore = isConnected ? 34 : 0
      
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000
      let aiScore = lastAiAnalysis > tenMinutesAgo ? 33 : 0
      
      let dataScore = activeDisasterExists ? 33 : 33 // Base 33% for satellite data always working

      setHealthBreakdown({
        firebase: firebaseScore,
        ai: aiScore,
        data: dataScore
      })
      setHealth(Math.min(firebaseScore + aiScore + dataScore, 100))
    }

    const connectedRef = ref(database, ".info/connected")
    const analysisRef = ref(database, "terra/aiAnalysis")
    const disasterRef = ref(database, "terra/activeDisaster")

    const unsubConnected = onValue(connectedRef, (snap) => {
      isConnected = !!snap.val()
      calculateHealth()
    })

    const unsubAnalysis = onValue(analysisRef, (snap) => {
      const data = snap.val()
      lastAiAnalysis = data?.lastUpdated || 0
      calculateHealth()
    })

    const unsubDisaster = onValue(disasterRef, (snap) => {
      activeDisasterExists = !!snap.val()
      calculateHealth()
    })

    const interval = setInterval(calculateHealth, 30000)

    return () => {
      unsubConnected()
      unsubAnalysis()
      unsubDisaster()
      clearInterval(interval)
    }
  }, [])

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-sidebar">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 min-w-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(69,175,219,0.3)] group-hover:scale-105 transition-transform">
            <Layers className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white group-data-[collapsible=icon]:hidden">TERRA</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4 group-data-[collapsible=icon]:hidden">
            Core Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "h-11 px-4 transition-all group",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:text-white" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4 group-data-[collapsible=icon]:hidden">
            Public Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/citizen"}
                  tooltip="Citizen Portal"
                  className={cn(
                    "h-11 px-4 transition-all group",
                    pathname === "/citizen"
                      ? "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90 hover:text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Link href="/citizen">
                    <UserCircle className={cn("h-5 w-5", pathname === "/citizen" ? "text-white" : "text-muted-foreground group-hover:text-accent transition-colors")} />
                    <span className="font-medium">Citizen Portal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4 group-data-[collapsible=icon]:hidden">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/authority-input"}
                  tooltip="Authority Input"
                  className={cn(
                    "h-11 px-4 transition-all group",
                    pathname === "/authority-input"
                      ? "bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90 hover:text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Link href="/authority-input">
                    <Lock className={cn("h-5 w-5", pathname === "/authority-input" ? "text-white" : "text-muted-foreground group-hover:text-destructive transition-colors")} />
                    <span className="font-medium">Authority Input</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 cursor-help group hover:bg-accent/20 transition-all shadow-lg shadow-accent/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-accent font-black uppercase tracking-widest">System Integrity</p>
                  <Info className="h-3 w-3 text-accent opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-accent/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-1000 shadow-[0_0_8px_var(--accent)]" 
                      style={{ width: `${health || 0}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-accent font-black">{health === null ? '—%' : `${health}%`}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="glass-card border-accent/20 p-3 space-y-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Firebase Link</span>
                  <Badge variant="outline" className={cn("text-[9px] font-mono", healthBreakdown.firebase > 0 ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive")}>
                    {healthBreakdown.firebase}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Neural Active</span>
                  <Badge variant="outline" className={cn("text-[9px] font-mono", healthBreakdown.ai > 0 ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive")}>
                    {healthBreakdown.ai}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Satellite Grid</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 text-[9px] font-mono">
                    {healthBreakdown.data}%
                  </Badge>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  )
}
