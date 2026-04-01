
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
  Loader2,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Send
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { database, ref, onValue, push, serverTimestamp } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Fallback data for offline/empty states
const MOCK_DISASTER = {
  type: "Monitoring",
  severity: "LOW",
  sector: "Global Surveillance",
  affectedPopulation: 0,
  evacuationPercent: 0,
  drainageCapacity: 100,
  minutesToInundation: 0
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [activeDisaster, setActiveDisaster] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [tacticalFeed, setTacticalFeed] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [systemOnline, setSystemOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isTimedOut, setIsTimedOut] = useState(false)

  // Functional UI State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState("")
  const [broadcastPriority, setBroadcastPriority] = useState("WARNING")
  const [lastReadTime, setLastReadTime] = useState<number>(Date.now())
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false)

  useEffect(() => {
    document.title = "TERRA | Command Center"

    const loadTimeout = setTimeout(() => {
      setLoading(false)
      setIsTimedOut(true)
    }, 5000)

    const connectedRef = ref(database, '.info/connected')
    const unsubSystem = onValue(connectedRef, (snap) => {
      setSystemOnline(!!snap.val())
    })

    const disasterRef = ref(database, 'terra/activeDisaster')
    const unsubscribeDisaster = onValue(disasterRef, (snapshot) => {
      if (snapshot.exists()) {
        setActiveDisaster(snapshot.val())
        setIsConnected(true)
        setIsTimedOut(false)
        setLoading(false)
        clearTimeout(loadTimeout)
      } else {
        setIsConnected(false)
      }
    })

    const weatherRef = ref(database, 'terra/weatherData')
    const unsubscribeWeather = onValue(weatherRef, (snapshot) => {
      if (snapshot.exists()) setWeather(snapshot.val())
    })

    const feedRef = ref(database, 'terra/tacticalFeed')
    const unsubscribeFeed = onValue(feedRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedArray = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        feedArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setTacticalFeed(feedArray.slice(0, 10))
      }
    })

    return () => {
      unsubscribeDisaster()
      unsubscribeWeather()
      unsubscribeFeed()
      unsubSystem()
      clearTimeout(loadTimeout)
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

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return
    
    const feedRef = ref(database, 'terra/tacticalFeed')
    push(feedRef, {
      message: broadcastMsg,
      priority: broadcastPriority,
      source: "authority",
      timestamp: new Date().toISOString()
    })

    toast({
      title: "Tactical Broadcast Transmitted",
      description: "Emergency instruction sent to all citizen and command nodes.",
    })

    setBroadcastMsg("")
    setIsBroadcastOpen(false)
  }

  const handleMarkAsRead = () => {
    setLastReadTime(Date.now())
  }

  const handleWeatherRefresh = () => {
    setIsWeatherRefreshing(true)
    setTimeout(() => setIsWeatherRefreshing(false), 1000)
    toast({
      title: "Atmospheric Re-Sync",
      description: "Live weather telemetry updated from satellite feed.",
    })
  }

  const currentData = activeDisaster || MOCK_DISASTER
  const sevConfig = getSeverityConfig(currentData.severity)

  // Unread CRITICAL alerts count
  const unreadCount = tacticalFeed.filter(
    m => m.priority === 'CRITICAL' && new Date(m.timestamp).getTime() > lastReadTime
  ).length

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
      
      {/* Offline Alert Banner */}
      {(!isConnected || isTimedOut || !systemOnline) && (
        <div className="bg-destructive/20 border border-destructive/30 px-4 py-2 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <WifiOff className="h-4 w-4 text-destructive" />
            <span className="text-[10px] font-black uppercase tracking-widest text-destructive">
              {!systemOnline ? "SYSTEM: OFFLINE — Waiting for Satellite Link" : "Neural Link Fragmented — Displaying Cached/Standby Data"}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-destructive hover:bg-destructive/10" onClick={() => window.location.reload()}>
            RE-ESTABLISH LINK
          </Button>
        </div>
      )}

      {/* Authority Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 rounded-xl border-l-4 border-l-primary shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
            <Radio className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Authority Command Center</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "text-[10px] gap-1.5 px-2",
                systemOnline ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-destructive/10 border-destructive/20 text-destructive"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", systemOnline ? "bg-emerald-500" : "bg-destructive")} />
                {systemOnline ? 'LIVE SUBCONTINENT GRID' : 'SATELLITE SYNC FAILED'}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{currentData.sector || 'Global'} | T-Zero Sync</span>
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
          
          <div className="flex items-center gap-2 ml-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 glass hover:bg-white/10" onClick={handleWeatherRefresh}>
              <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isWeatherRefreshing && "animate-spin")} />
            </Button>
            <Button 
              onClick={() => setIsBroadcastOpen(true)}
              className="bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 font-bold tracking-widest text-[10px] h-10 px-6"
            >
              EMERGENCY BROADCAST
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Tactical Map */}
        <div className="lg:col-span-8 relative">
           <TerraMap 
            center={[72.8777, 19.0760]} 
            zoom={12}
            enable3D={true}
            markers={[
              { id: '1', coordinates: [72.8777, 19.0760], type: 'incident', severity: currentData.severity.toLowerCase(), label: currentData.sector || 'Active Point' }
            ]}
          />
          <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs space-y-3 pointer-events-none">
             <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-black uppercase italic tracking-widest">Active Analysis</span>
             </div>
             <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                {currentData.sector} drainage system at <span className="text-primary font-bold">{currentData.drainageCapacity}% capacity</span>. {currentData.minutesToInundation > 0 && `Projected inundation within ${currentData.minutesToInundation} minutes.`}
             </p>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          <Card className={cn("glass-card border-t-4 shadow-2xl transition-all duration-500", currentData.severity === 'CRITICAL' ? 'border-t-destructive' : 'border-t-primary')}>
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Strategic Threat</CardTitle>
                <Badge variant={currentData.severity === 'CRITICAL' ? 'destructive' : 'outline'} className={cn("animate-pulse text-[9px] px-2 h-5 uppercase", currentData.severity !== 'CRITICAL' && "text-primary border-primary/20")}>
                  {currentData.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="text-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Affected Population</div>
                  <div className="text-4xl font-black tracking-tighter text-white">
                    {currentData.affectedPopulation?.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <Users className="h-3 w-3 text-primary" />
                     <span className="text-[10px] font-mono text-primary font-bold">{currentData.evacuationPercent}% Evacuation Verified</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                    <span>Sector Integrity</span>
                    <span className={cn("font-mono", (100 - currentData.drainageCapacity) > 50 ? "text-destructive" : "text-amber-500")}>
                      {100 - currentData.drainageCapacity}% DEPLETION
                    </span>
                  </div>
                  <Progress value={currentData.drainageCapacity} className={cn("h-1.5", currentData.drainageCapacity < 40 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary")} />
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
              <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-white/5" onClick={handleMarkAsRead}>
                <Bell className={cn("h-4 w-4", unreadCount > 0 ? "text-destructive animate-swing" : "text-muted-foreground")} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </CardHeader>
            <ScrollArea className="flex-1">
               <div className="divide-y divide-white/5">
                  {tacticalFeed.length > 0 ? (
                    tacticalFeed.map((alert) => (
                      <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors cursor-default group">
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
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center opacity-40">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">No Active Alerts In Feed</p>
                    </div>
                  )}
               </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Emergency Broadcast Modal */}
      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className="glass-card sm:max-w-[500px] border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-destructive">
              <Radio className="h-5 w-5 animate-pulse" />
              Emergency Global Broadcast
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Message</label>
              <Textarea 
                placeholder="Enter critical instructions for all active sectors..."
                className="bg-white/5 border-white/10 h-32 font-medium"
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tactical Priority</label>
              <Select value={broadcastPriority} onValueChange={setBroadcastPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">CRITICAL (Immediate Action)</SelectItem>
                  <SelectItem value="WARNING">WARNING (High Risk)</SelectItem>
                  <SelectItem value="INFO">INFO (Situational Update)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBroadcastOpen(false)} className="glass font-bold h-12 px-6">CANCEL</Button>
            <Button onClick={handleBroadcast} className="bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest h-12 px-8 gap-2">
              <Send className="h-4 w-4" />
              BROADCAST NOW
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  )
}
