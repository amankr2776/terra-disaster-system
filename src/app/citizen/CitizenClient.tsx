"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Navigation, 
  ShieldCheck, 
  AlertCircle,
  Tent,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { database, ref, onValue } from "@/lib/firebase"
import { formatDistanceToNow } from "date-fns"
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CHECKLIST_ITEMS = [
  { id: "phone", label: "Phone fully charged" },
  { id: "docs", label: "Important documents in waterproof bag" },
  { id: "water", label: "3-day supply of drinking water" },
  { id: "firstaid", label: "First aid kit ready" },
  { id: "meeting", label: "Family meeting point decided" },
  { id: "contacts", label: "Emergency contacts saved" }
]

export function CitizenClient() {
  const [activeDisaster, setActiveDisaster] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [warnings, setWarnings] = useState<any[]>([])
  const [reliefCamps, setReliefCamps] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const [areaName, setAreaName] = useState<string>("Detecting location...")
  const [showRoutes, setShowRoutes] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)

  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    const unsubDisaster = onValue(ref(database, 'terra/activeDisaster'), (snap) => setActiveDisaster(snap.val()))
    const unsubWeather = onValue(ref(database, 'terra/weatherData'), (snap) => setWeather(snap.val()))
    const unsubFeed = onValue(ref(database, 'terra/tacticalFeed'), (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedArray = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }))
        const alerts = feedArray
          .filter(m => m.priority === 'CRITICAL' || m.priority === 'WARNING')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 3)
        setWarnings(alerts)
      }
    })
    const unsubCamps = onValue(ref(database, 'terra/reliefCamps'), (snap) => {
      if (snap.exists()) {
        const camps = Object.values(snap.val())
        setReliefCamps(camps.sort((a: any, b: any) => (a.capacityPercent || 0) - (b.capacityPercent || 0)))
      }
    })
    const unsubAi = onValue(ref(database, 'terra/aiAnalysis'), (snap) => snap.exists() && setAiAnalysis(snap.val()))

    const savedChecklist = localStorage.getItem('terra_citizen_checklist')
    if (savedChecklist) setChecklist(JSON.parse(savedChecklist))

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setUserCoords(coords)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords[1]}&lon=${coords[0]}&format=json`)
          const data = await res.json()
          const name = data.address?.suburb || data.address?.neighbourhood || data.address?.city || "Active Sector"
          setAreaName(name)
        } catch (e) { setAreaName("Active Sector") }
      }, () => setAreaName("Location Denied"))
    }

    return () => { unsubDisaster(); unsubWeather(); unsubFeed(); unsubCamps(); unsubAi(); }
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !userCoords) return
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || 'zHj4ilgxRPn8cl8QciXg'
    const styleUrl = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maptilerKey}`
    const map = new maplibregl.Map({ container: mapContainer.current, style: styleUrl, center: userCoords, zoom: 13, attributionControl: false })
    mapRef.current = map
    map.on('load', () => {
      map.addSource('evac-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'route-line', type: 'line', source: 'evac-route', paint: { 'line-color': '#45AFDB', 'line-width': 5, 'line-blur': 2 } })
    })
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }
  }, [userCoords])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    if (userCoords) {
      const el = document.createElement('div')
      el.className = 'w-4 h-4 bg-primary rounded-full border-2 border-white shadow-[0_0_10px_#45AFDB] animate-pulse'
      const marker = new maplibregl.Marker(el).setLngLat(userCoords).addTo(map)
      markersRef.current.push(marker)
    }
    reliefCamps.forEach((camp: any) => {
      const coords: [number, number] = [(userCoords?.[0] || 72.87) + (Math.random() - 0.5) * 0.04, (userCoords?.[1] || 19.07) + (Math.random() - 0.5) * 0.04]
      const el = document.createElement('div')
      el.className = 'w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_8px_#10b981]'
      const marker = new maplibregl.Marker(el).setLngLat(coords).setPopup(new maplibregl.Popup().setHTML(`<div class="p-2 font-bold text-xs">${camp.name}</div>`)).addTo(map)
      markersRef.current.push(marker)
    })
  }, [userCoords, reliefCamps])

  const toggleEvacRoutes = () => {
    if (!mapRef.current || !userCoords) return
    const map = mapRef.current
    const newState = !showRoutes
    setShowRoutes(newState)
    if (newState) {
      const target: [number, number] = [userCoords[0] + 0.015, userCoords[1] + 0.012]
      const source = map.getSource('evac-route') as maplibregl.GeoJSONSource
      if (source) source.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [userCoords, target] } } as any)
      map.flyTo({ center: userCoords, zoom: 14 })
    } else {
      const source = map.getSource('evac-route') as maplibregl.GeoJSONSource
      if (source) source.setData({ type: 'FeatureCollection', features: [] })
    }
  }

  const toggleChecklist = (id: string) => {
    const newChecklist = { ...checklist, [id]: !checklist[id] }
    setChecklist(newChecklist)
    localStorage.setItem('terra_citizen_checklist', JSON.stringify(newChecklist))
  }

  const checklistProgress = Math.round((Object.values(checklist).filter(Boolean).length / CHECKLIST_ITEMS.length) * 100)

  const sevConfig = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL': return { bg: 'bg-destructive animate-pulse-slow', icon: AlertTriangle, label: 'CRITICAL ALERT' }
      case 'HIGH': return { bg: 'bg-orange-600', icon: AlertCircle, label: 'HIGH RISK' }
      case 'MODERATE': return { bg: 'bg-amber-500', icon: AlertCircle, label: 'WARNING' }
      default: return { bg: 'bg-emerald-600', icon: ShieldCheck, label: 'AREA SECURE' }
    }
  }

  const currentSev = sevConfig(activeDisaster?.severity)

  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-[#0a0a0a] text-white pb-32 font-space relative overflow-x-hidden">
      <div className={cn("sticky top-0 z-50 p-5 flex items-center justify-between shadow-2xl", currentSev.bg)}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-black/20 rounded-lg">
            <currentSev.icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic leading-none">{activeDisaster?.type?.toUpperCase() || 'DISASTER'} {currentSev.label}</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mt-1">{activeDisaster?.sector || 'Monitoring'} — {areaName}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge className="bg-white/20 text-white border-none text-[9px] font-bold px-3">LIVE</Badge>
          <div className="text-[9px] font-black uppercase mt-1 opacity-60">
            {activeDisaster?.lastUpdated ? formatDistanceToNow(new Date(activeDisaster.lastUpdated), { addSuffix: true }) : 'Syncing...'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-white/10 border-b border-white/5">
        <div className="bg-white/[0.02] p-4 flex flex-col items-center gap-1">
          <CloudRain className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Rain</span>
          <span className="text-xs font-black">{weather?.rainfall || 0}mm</span>
        </div>
        <div className="bg-white/[0.02] p-4 flex flex-col items-center gap-1">
          <Wind className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Wind</span>
          <span className="text-xs font-black">{weather?.windSpeed || 0}km/h</span>
        </div>
        <div className="bg-white/[0.02] p-4 flex flex-col items-center gap-1">
          <Thermometer className="h-4 w-4 text-amber-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Temp</span>
          <span className="text-xs font-black">{weather?.temperature || 0}°C</span>
        </div>
        <div className="bg-white/[0.02] p-4 flex flex-col items-center gap-1">
          <Droplets className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Hum</span>
          <span className="text-xs font-black">{weather?.humidity || 0}%</span>
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-3 w-3" /> Tactical Intelligence Feed
        </h2>
        <div className="space-y-3">
          {warnings.length > 0 ? warnings.map((warn, i) => (
            <Alert key={i} className="glass-card border-none border-l-4 border-l-destructive">
              <AlertTitle className="text-xs font-black uppercase flex items-center justify-between mb-2">
                <span className={warn.priority === 'CRITICAL' ? 'text-destructive' : 'text-amber-500'}>{warn.priority} MESSAGE</span>
                <span className="text-[9px] font-mono opacity-40">{formatDistanceToNow(new Date(warn.timestamp))} ago</span>
              </AlertTitle>
              <AlertDescription className="text-sm font-bold leading-relaxed italic">"{warn.message}"</AlertDescription>
              <div className="mt-3"><Badge variant="outline" className="text-[8px] h-4 bg-white/5 uppercase">{warn.source}</Badge></div>
            </Alert>
          )) : <div className="text-center py-8 opacity-20 text-[10px] uppercase">No active alerts</div>}
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div className="h-80 w-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative">
          <div ref={mapContainer} className="w-full h-full" />
          <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Tactical Sync
          </div>
        </div>
        <Button onClick={toggleEvacRoutes} className={cn("w-full h-14 rounded-2xl font-black uppercase text-xs gap-3 shadow-xl transition-all", showRoutes ? "bg-white text-primary" : "bg-primary text-white")}>
          <Navigation className="h-5 w-5" /> {showRoutes ? "HIDE EVACUATION ROUTES" : "SHOW NEAREST EVACUATION ROUTE"}
        </Button>
      </div>

      <div className="px-5 py-10 space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
          <Tent className="h-3 w-3" /> Relief Camp Logistics
        </h2>
        <div className="space-y-3">
          {reliefCamps.length > 0 ? reliefCamps.map((camp, i) => (
            <Card key={i} className={cn("glass-card border-none", camp.capacityPercent >= 100 && "opacity-40")}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn("p-2 rounded-xl", camp.capacityPercent >= 100 ? "bg-muted" : "bg-emerald-500/20")}>
                    <Tent className={cn("h-5 w-5", camp.capacityPercent >= 100 ? "text-muted-foreground" : "text-emerald-500")} />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black uppercase truncate">{camp.name}</h3>
                      <Badge variant={camp.capacityPercent >= 100 ? "destructive" : "outline"} className="text-[8px] h-3.5 px-1 font-black">{camp.capacityPercent >= 100 ? "FULL" : "OPEN"}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                      <span>{camp.distance} KM AWAY</span>
                      <span className={cn(camp.capacityPercent > 80 ? "text-destructive" : "text-emerald-500")}>{camp.capacityPercent}% LOAD</span>
                    </div>
                    <Progress value={camp.capacityPercent} className="h-1 mt-3 bg-white/5 [&>div]:bg-emerald-500" />
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10" asChild>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(camp.name)}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>
                </Button>
              </CardContent>
            </Card>
          )) : <div className="text-center py-8 italic text-xs opacity-40">No nearby camps indexed...</div>}
        </div>
      </div>

      <div className="px-5 pb-10">
        <Card className="glass-card border-none overflow-hidden">
          <CardHeader className="p-5 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsChecklistOpen(!isChecklistOpen)}>
            <div className="space-y-1">
              <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> ARE YOU PREPARED?
              </CardTitle>
              <div className="flex items-center gap-3">
                <Progress value={checklistProgress} className="h-1.5 w-24 bg-white/5" />
                <span className="text-[10px] font-bold text-emerald-500">{checklistProgress}%</span>
              </div>
            </div>
            {isChecklistOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardHeader>
          {isChecklistOpen && (
            <CardContent className="px-5 pb-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {CHECKLIST_ITEMS.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer" onClick={() => toggleChecklist(item.id)}>
                    <Checkbox checked={checklist[item.id]} className="border-white/20 data-[state=checked]:bg-emerald-500" />
                    <label className={cn("text-xs font-bold leading-none cursor-pointer", checklist[item.id] && "line-through text-muted-foreground")}>{item.label}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="px-5 pb-20 space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
          <Phone className="h-3 w-3" /> Regional Response Helplines
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" className="h-14 rounded-2xl justify-between px-5 bg-white/5 border-white/10" asChild>
            <a href="tel:01124363260">
              <div className="text-left"><p className="text-[10px] font-bold text-muted-foreground uppercase">NDRF Helpline</p><p className="text-sm font-black italic">011-24363260</p></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl justify-between px-5 bg-white/5 border-white/10" asChild>
            <a href="tel:1078">
              <div className="text-left"><p className="text-[10px] font-bold text-muted-foreground uppercase">Flood Control Room</p><p className="text-sm font-black italic">1078</p></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[60]">
        <div className="max-w-[640px] mx-auto">
          <Button className="w-full h-16 rounded-3xl bg-destructive text-white font-black text-xl uppercase italic shadow-[0_0_30px_rgba(239,68,68,0.4)] flex gap-4" asChild>
            <a href="tel:112"><Phone className="h-7 w-7" /> CALL 112 EMERGENCY</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
