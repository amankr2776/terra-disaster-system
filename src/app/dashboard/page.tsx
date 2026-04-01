
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TerraMap } from "@/components/map/TerraMap"
import { 
  Users, 
  CloudRain,
  Zap,
  Wind,
  Thermometer,
  Bell,
  Radio,
  CircleAlert,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { database, ref, onValue } from "@/lib/firebase"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [activeDisaster, setActiveDisaster] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [tacticalFeed, setTacticalFeed] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "TERRA | Command Center"

    // 1. Listen for Active Disaster
    const disasterRef = ref(database, 'terra/activeDisaster')
    const unsubscribeDisaster = onValue(disasterRef, (snapshot) => {
      setActiveDisaster(snapshot.val())
      setIsConnected(true)
      setLoading(false)
    })

    // 2. Listen for Weather Telemetry
    const weatherRef = ref(database, 'terra/weatherData')
    const unsubscribeWeather = onValue(weatherRef, (snapshot) => {
      setWeather(snapshot.val())
    })

    // 3. Listen for Tactical Feed
    const feedRef = ref(database, 'terra/tacticalFeed')
    const unsubscribeFeed = onValue(feedRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedArray = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        // Sort newest first based on timestamp
        feedArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setTacticalFeed(feedArray.slice(0, 10))
      }
    })

    return () => {
      unsubscribeDisaster()
      unsubscribeWeather()
      unsubscribeFeed()
    }
  }, [])

  const getSeverityConfig = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' }
      case 'HIGH': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
      case 'MODERATE': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
      case 'LOW': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
      default: return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' }
    }
  }

  const sevConfig = getSeverityConfig(activeDisaster?.severity)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Satellite Link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
      
      {/* Authority Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 rounded-xl border-l-4 border-l-primary shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
            <Radio className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Authority Command Center</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-500 gap-1.5 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isConnected ? 'LIVE SUBCONTINENT GRID' : 'SATELLITE SYNCING...'}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{activeDisaster?.sector || 'Global'} | T-Zero Sync</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-4">
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Precipitation</div>
                <div className="text-lg font-mono font-bold text-primary leading-none">
                  {weather?.rainfall || 0}mm/h
                </div>
             </div>
             <CloudRain className="h-5 w-5 text-primary opacity-50" />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Wind Speed</div>
                <div className="text-lg font-mono font-bold text-accent leading-none">
                  {weather?.windSpeed || 0}km/h
                </div>
             </div>
             <Wind className="h-5 w-5 text-accent opacity-50" />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Atmosphere</div>
                <div className="text-lg font-mono font-bold text-amber-500 leading-none">
                  {weather?.temperature || 0}°C
                </div>
             </div>
             <Thermometer className="h-5 w-5 text-amber-500 opacity-50" />
          </div>
          <Button size="sm" className="bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 font-bold tracking-widest text-[10px] h-10 px-6">
            EMERGENCY BROADCAST
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Full Screen Tactical Map */}
        <div className="lg:col-span-8 relative">
           <TerraMap 
            center={[72.8777, 19.0760]} // Mumbai Tactical Grid
            zoom={12}
            enable3D={true}
            markers={[
              { id: '1', coordinates: [72.8777, 19.0760], type: 'incident', severity: 'high', label: activeDisaster?.sector || 'Active Point' },
              { id: '2', coordinates: [72.8250, 19.0500], type: 'incident', severity: 'medium', label: 'Inundation Zone' },
              { id: '3', coordinates: [72.8500, 19.1000], type: 'resource', label: 'Tactical Team' }
            ]}
          />
          <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs space-y-3 pointer-events-none">
             <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-black uppercase italic tracking-widest">Active Analysis</span>
             </div>
             <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                {activeDisaster?.sector || 'Unknown District'} drainage system at <span className="text-primary font-bold">{activeDisaster?.drainageCapacity || 0}% capacity</span>. Projected inundation within <span className="text-amber-500 font-bold">{activeDisaster?.minutesToInundation || 0} minutes</span>.
             </p>
          </div>
        </div>

        {/* Intelligence Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          <Card className={cn("glass-card border-t-4 shadow-2xl transition-all duration-500", activeDisaster?.severity === 'CRITICAL' ? 'border-t-destructive' : 'border-t-primary')}>
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Strategic Threat</CardTitle>
                <Badge variant={activeDisaster?.severity === 'CRITICAL' ? 'destructive' : 'outline'} className={cn("animate-pulse text-[9px] px-2 h-5 uppercase", activeDisaster?.severity !== 'CRITICAL' && "text-primary border-primary/20")}>
                  {activeDisaster?.severity || 'MONITORING'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="text-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Affected Population</div>
                  <div className="text-4xl font-black tracking-tighter text-white">
                    {activeDisaster?.affectedPopulation?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <Users className="h-3 w-3 text-primary" />
                     <span className="text-[10px] font-mono text-primary font-bold">{activeDisaster?.evacuationPercent || 0}% Evacuation Verified</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                    <span>Sector Integrity</span>
                    <span className={cn("font-mono", (100 - (activeDisaster?.drainageCapacity || 0)) > 50 ? "text-destructive" : "text-amber-500")}>
                      {100 - (activeDisaster?.drainageCapacity || 0)}% DEPLETION
                    </span>
                  </div>
                  <Progress value={activeDisaster?.drainageCapacity || 0} className={cn("h-1.5", (activeDisaster?.drainageCapacity || 0) < 40 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary")} />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                     <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Resource Load</span>
                     <span className="text-xl font-bold text-accent">92.4%</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                     <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1">System Health</span>
                     <span className="text-xl font-bold text-emerald-500">OPTIMAL</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="glass-card flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Tactical Feed</CardTitle>
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <ScrollArea className="flex-1">
               <div className="divide-y divide-white/5">
                  {tacticalFeed.length > 0 ? (
                    tacticalFeed.map((alert, i) => (
                      <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors cursor-default group animate-in fade-in slide-in-from-top-2 duration-500">
                         <div className="flex items-start gap-3">
                            <div className={cn(
                              "mt-0.5 rounded-full p-1.5",
                              alert.priority === 'CRITICAL' ? 'bg-destructive/20 text-destructive' :
                              alert.priority === 'WARNING' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                            )}>
                              <CircleAlert className="h-3 w-3" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium leading-relaxed group-hover:text-white transition-colors">{alert.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-mono text-muted-foreground">
                                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <Badge className={cn(
                                  "text-[8px] h-3.5 px-1 border-none font-black uppercase",
                                  alert.source === 'ai' ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                                )}>
                                  {alert.source}
                                </Badge>
                                <span className="text-[9px] font-mono text-muted-foreground opacity-50 uppercase tracking-tighter">PRIORITY: {alert.priority}</span>
                              </div>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                      <Radio className="h-8 w-8 text-muted-foreground/20 mb-2" />
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Awaiting Tactical Feed Sync...</p>
                    </div>
                  )}
               </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
