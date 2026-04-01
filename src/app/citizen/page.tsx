"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TerraMap } from "@/components/map/TerraMap"
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Navigation, 
  Home, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrafficCone,
  Tent,
  LifeBuoy,
  Loader2,
  Edit2,
  Check,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { database, ref, onValue } from "@/lib/firebase"

type ThreatLevel = 'safe' | 'warning' | 'high' | 'critical' | 'MODERATE' | 'LOW' | 'HIGH' | 'CRITICAL';

export default function CitizenPortalPage() {
  const [activeDisaster, setActiveDisaster] = useState<any>(null)
  const [warnings, setWarnings] = useState<any[]>([])
  const [reliefCamps, setReliefCamps] = useState<any[]>([])
  const [evacRoutes, setEvacRoutes] = useState<any[]>([])
  
  const [userLocation, setUserLocation] = useState<string>("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationInput, setLocationInput] = useState("")

  useEffect(() => {
    document.title = "TERRA | Citizen Protection";
    
    // 1. Geolocation Logic
    const savedLocation = localStorage.getItem('terra_user_location')
    if (savedLocation) {
      setUserLocation(savedLocation)
      setLocationInput(savedLocation)
    } else {
      detectLocation()
    }

    // 2. Firebase Listeners
    const disasterRef = ref(database, 'terra/activeDisaster')
    const unsubscribeDisaster = onValue(disasterRef, (snapshot) => {
      setActiveDisaster(snapshot.val())
    })

    const feedRef = ref(database, 'terra/tacticalFeed')
    const unsubscribeFeed = onValue(feedRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedArray = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        // Filter for Critical/Warning and take top 3
        const highPriority = feedArray
          .filter(m => m.priority === 'CRITICAL' || m.priority === 'WARNING')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 3)
        setWarnings(highPriority)
      }
    })

    const campsRef = ref(database, 'terra/reliefCamps')
    const unsubscribeCamps = onValue(campsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const sortedCamps = Object.values(data).sort((a: any, b: any) => a.capacityPercent - b.capacityPercent)
        setReliefCamps(sortedCamps)
      }
    })

    const routesRef = ref(database, 'terra/evacRoutes')
    const unsubscribeRoutes = onValue(routesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setEvacRoutes(Object.values(data))
      }
    })

    return () => {
      unsubscribeDisaster()
      unsubscribeFeed()
      unsubscribeCamps()
      unsubscribeRoutes()
    }
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await res.json()
        const areaName = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || "Unknown Sector"
        setUserLocation(areaName)
        setLocationInput(areaName)
        localStorage.setItem('terra_user_location', areaName)
      } catch (error) {
        console.error("Location resolution failed", error)
      } finally {
        setIsDetecting(false)
      }
    }, (error) => {
      console.warn("Geolocation denied", error)
      setIsDetecting(false)
    })
  }

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationInput.trim()) return
    setUserLocation(locationInput)
    localStorage.setItem('terra_user_location', locationInput)
    setIsEditingLocation(false)
  }

  const getThreatConfig = (severity: string) => {
    const sev = severity?.toUpperCase() || 'LOW'
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: "bg-destructive",
          text: "CRITICAL ALERT",
          subtext: "Move to higher ground immediately.",
          icon: AlertTriangle,
          badge: "RED - CRITICAL"
        }
      case 'HIGH':
        return {
          bg: "bg-orange-600",
          text: "HIGH RISK WARNING",
          subtext: "Prepare for possible evacuation.",
          icon: AlertCircle,
          badge: "ORANGE - HIGH RISK"
        }
      case 'MODERATE':
        return {
          bg: "bg-amber-500",
          text: "MODERATE RISK",
          subtext: "Stay tuned to local updates.",
          icon: Info,
          badge: "YELLOW - WARNING"
        }
      default:
        return {
          bg: "bg-emerald-600",
          text: "AREA SECURE",
          subtext: "No immediate threats detected.",
          icon: ShieldCheck,
          badge: "GREEN - SAFE"
        }
    }
  }

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Never"
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (diff < 1) return "Just now"
    return `${diff}m ago`
  }

  const config = getThreatConfig(activeDisaster?.severity);

  return (
    <div className="max-w-md mx-auto space-y-8 pb-32 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Threat Level Banner */}
      <div className={`${config.bg} text-white p-6 rounded-2xl shadow-2xl space-y-4 border-b-4 border-black/20`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                Your Area: {isDetecting ? "Detecting..." : (userLocation || "Not Set")}
              </span>
              {!isDetecting && (
                <button 
                  onClick={() => setIsEditingLocation(!isEditingLocation)}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <Badge className="bg-white/20 text-white border-none text-[9px] font-bold">{config.badge}</Badge>
          </div>

          {isEditingLocation ? (
            <form onSubmit={handleLocationSubmit} className="flex gap-2 mb-2 animate-in fade-in slide-in-from-top-1">
              <Input 
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter your area..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-9 font-bold text-sm focus:ring-white"
                autoFocus
              />
              <Button type="submit" size="icon" className="h-9 w-9 bg-white text-destructive hover:bg-white/90">
                <Check className="h-4 w-4" />
              </Button>
            </form>
          ) : !userLocation && !isDetecting ? (
            <div className="mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-black text-[10px] tracking-widest uppercase"
                onClick={() => setIsEditingLocation(true)}
              >
                Set Your Location
              </Button>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <config.icon className={`h-8 w-8 shrink-0 ${activeDisaster?.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
            <h1 className="text-2xl font-black leading-tight tracking-tighter uppercase italic">
              {activeDisaster?.type?.toUpperCase() || "DISASTER"} {config.text}
            </h1>
          </div>
        </div>
        <p className="text-base font-bold opacity-90 leading-snug italic">
          "{config.subtext}"
        </p>
      </div>

      {/* 2. Active Warnings */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Active Warnings
        </h2>
        <div className="space-y-3">
          {warnings.length > 0 ? warnings.map((warn, i) => (
            <Alert key={i} variant={warn.priority === 'CRITICAL' ? 'destructive' : 'default'} className={cn(
              "rounded-xl border-white/10",
              warn.priority === 'WARNING' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-destructive/10 border-destructive/20"
            )}>
              {warn.priority === 'CRITICAL' ? <AlertTriangle className="h-4 w-4" /> : <TrafficCone className="h-4 w-4" />}
              <AlertTitle className="font-black text-sm uppercase flex items-center justify-between">
                {warn.priority}
                <span className="text-[10px] font-mono opacity-60">{new Date(warn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </AlertTitle>
              <AlertDescription className="text-xs font-medium opacity-80">
                {warn.message}
              </AlertDescription>
            </Alert>
          )) : (
            <div className="text-center py-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">
              No active high-priority warnings
            </div>
          )}
        </div>
      </div>

      {/* 3. Small Map */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          Tactical Map
        </h2>
        <div className="h-56 w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl relative">
          <TerraMap 
            center={activeDisaster?.sector?.includes('Mumbai') ? [72.8777, 19.0760] : [80.245, 13.000]}
            zoom={12}
            enable3D={false}
            markers={[
              { id: '1', coordinates: activeDisaster?.sector?.includes('Mumbai') ? [72.8777, 19.0760] : [80.245, 13.000], type: 'incident', severity: 'high', label: activeDisaster?.sector || 'Alert Area' },
            ]}
          />
          <div className="absolute bottom-3 left-3 glass px-3 py-1 rounded-full text-[9px] font-bold text-white z-10">
            DANGER ZONES MARKED RED
          </div>
        </div>
      </div>

      {/* 4. Evacuation Routes */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <Navigation className="h-3 w-3" />
          Evacuation Routes
        </h2>
        <div className="space-y-2">
          {evacRoutes.length > 0 ? evacRoutes.map((route, i) => (
            <Button key={i} variant="outline" className="w-full h-16 justify-between px-5 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
              <div className="flex items-center gap-4 text-left">
                <div className={cn("p-2 rounded-lg", route.status === 'blocked' ? "bg-destructive/20" : "bg-emerald-500/20")}>
                  <Navigation className={cn("h-5 w-5", route.status === 'blocked' ? "text-destructive" : "text-emerald-500")} />
                </div>
                <div>
                  <p className={cn("font-black text-sm", route.status === 'blocked' && "line-through opacity-40")}>{route.name}</p>
                  <p className={cn("text-[10px] uppercase font-bold", route.status === 'blocked' ? "text-destructive" : "text-emerald-500")}>
                    {route.status === 'blocked' ? 'BLOCKED' : 'Clear Flow'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          )) : (
            <div className="text-center py-4 text-[10px] text-muted-foreground italic">No evacuation routes broadcasted</div>
          )}
        </div>
      </div>

      {/* 5. Relief Camps */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <Tent className="h-3 w-3" />
          Relief Camps
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {reliefCamps.length > 0 ? reliefCamps.map((camp, i) => {
            const capValue = parseInt(camp.capacityPercent || 0)
            const isFull = capValue >= 100
            const isWarning = capValue >= 60 && capValue < 100

            return (
              <div 
                key={i} 
                className={cn(
                  "p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between transition-all duration-300",
                  isFull && "opacity-40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors", 
                    isFull ? "bg-muted" : "bg-primary/20"
                  )}>
                    <Tent className={cn(
                      "h-4 w-4", 
                      isFull ? "text-muted-foreground" : "text-primary"
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold transition-all", 
                      isFull && "line-through text-muted-foreground"
                    )}>
                      {camp.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{camp.distance} km away</p>
                    {isFull && (
                      <p className="text-[8px] text-destructive font-black uppercase tracking-tighter mt-1 animate-pulse">
                        Do not proceed — no capacity available
                      </p>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={isFull ? "destructive" : "outline"} 
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    !isFull && isWarning && "border-amber-500 text-amber-500 bg-amber-500/10",
                    !isFull && !isWarning && "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                  )}
                >
                  {isFull ? "FULL" : "OPEN"} {capValue}%
                </Badge>
              </div>
            )
          }) : (
            <div className="text-center py-4 text-[10px] text-muted-foreground italic">No active relief camps found nearby</div>
          )}
        </div>
      </div>

      {/* 6. Emergency Button (Fixed) */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
        <Button className="w-full h-16 text-lg font-black bg-destructive hover:bg-destructive/90 text-white rounded-2xl shadow-2xl gap-3 border-4 border-white/10 animate-bounce">
          <Phone className="h-6 w-6" />
          EMERGENCY HELP (112)
        </Button>
      </div>

      {/* Quick Footer Info */}
      <div className="text-center pb-8 opacity-40 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest">TERRA Citizen Protection Grid • v2.1</p>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
          <Clock className="h-3 w-3" />
          LAST UPDATED: {getTimeAgo(activeDisaster?.lastUpdated)}
        </div>
      </div>

    </div>
  )
}
