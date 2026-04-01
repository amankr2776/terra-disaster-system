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
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

type ThreatLevel = 'safe' | 'warning' | 'high' | 'critical';

const RELIEF_CAMPS = [
  { name: "City Central School", distance: "0.8 km", status: "Open", capacity: "80%" },
  { name: "Community Hall B", distance: "1.5 km", status: "Open", capacity: "45%" },
  { name: "Sports Arena North", distance: "2.2 km", status: "Full", capacity: "100%" },
]

export default function CitizenPortalPage() {
  const [currentThreat] = useState<{level: ThreatLevel}>({
    level: "critical",
  });

  const [userLocation, setUserLocation] = useState<string>("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationInput, setLocationInput] = useState("")

  useEffect(() => {
    const savedLocation = localStorage.getItem('terra_user_location')
    if (savedLocation) {
      setUserLocation(savedLocation)
      setLocationInput(savedLocation)
    } else {
      detectLocation()
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

  const getThreatConfig = (level: ThreatLevel) => {
    switch (level) {
      case 'critical':
        return {
          bg: "bg-destructive",
          text: "CRITICAL FLOOD WARNING",
          subtext: "Move to higher ground immediately.",
          icon: AlertTriangle,
          badge: "RED - CRITICAL"
        }
      case 'high':
        return {
          bg: "bg-orange-600",
          text: "HIGH RISK ALERT",
          subtext: "Prepare for possible evacuation.",
          icon: AlertCircle,
          badge: "ORANGE - HIGH RISK"
        }
      case 'warning':
        return {
          bg: "bg-amber-500",
          text: "WEATHER WARNING",
          subtext: "Stay tuned to local updates.",
          icon: Info,
          badge: "YELLOW - WARNING"
        }
      default:
        return {
          bg: "bg-emerald-600",
          text: "AREA SECURE",
          subtext: "No active threats detected.",
          icon: ShieldCheck,
          badge: "GREEN - SAFE"
        }
    }
  }

  const config = getThreatConfig(currentThreat.level);

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
            <config.icon className={`h-8 w-8 shrink-0 ${currentThreat.level === 'critical' ? 'animate-pulse' : ''}`} />
            <h1 className="text-2xl font-black leading-tight tracking-tighter">
              {config.text}
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
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-black text-sm uppercase">Flood Warning</AlertTitle>
            <AlertDescription className="text-xs font-medium opacity-80">
              River Adyar levels are rising. Avoid basement levels.
            </AlertDescription>
          </Alert>

          <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 rounded-xl">
            <TrafficCone className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-black text-sm uppercase">Road Closure</AlertTitle>
            <AlertDescription className="text-xs font-medium opacity-80">
              Main Bridge is CLOSED due to water logging.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* 3. Small Map */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          Safety Map
        </h2>
        <div className="h-56 w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl relative">
          <TerraMap 
            center={[80.245, 13.000]}
            zoom={13}
            enable3D={false}
            markers={[
              { id: '1', coordinates: [80.245, 13.000], type: 'incident', severity: 'high', label: 'Flood Risk' },
              { id: '2', coordinates: [80.255, 13.010], type: 'shelter', label: 'Relief Camp' }
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
          <Button variant="outline" className="w-full h-16 justify-between px-5 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
            <div className="flex items-center gap-4 text-left">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Navigation className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-black text-sm">GST ROAD EXIT</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Safe Route • Clear Flow</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 5. Relief Camps */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
          <Tent className="h-3 w-3" />
          Relief Camps
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {RELIEF_CAMPS.map((camp, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Tent className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{camp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{camp.distance} away</p>
                </div>
              </div>
              <Badge variant={camp.status === 'Full' ? 'destructive' : 'outline'} className="text-[9px] font-bold">
                {camp.status} {camp.capacity}
              </Badge>
            </div>
          ))}
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
      <div className="text-center pb-8 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-widest">TERRA Citizen Protection Grid • v2.0</p>
      </div>

    </div>
  )
}
