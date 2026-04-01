
"use client"

import { useState, useEffect, useMemo } from "react"
import { TerraMap } from "@/components/map/TerraMap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Zap, RotateCcw, Play, Pause, Activity, Box, Waves, Flame, Tornado, Thermometer, Cpu } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { database, ref, onValue } from "@/lib/firebase"

const disasterConfig = {
  flood: { icon: Waves, color: "#45AFDB", label: "Inundation Spread" },
  fire: { icon: Flame, color: "#ef4444", label: "Thermal Spread" },
  cyclone: { icon: Tornado, color: "#7D66ED", label: "Wind Vortex" },
  heatwave: { icon: Thermometer, color: "#f59e0b", label: "Ambient Stress" },
  earthquake: { icon: Activity, color: "#71717a", label: "Seismic Ripple" }
}

const cityZones: Record<string, string[]> = {
  mumbai: ["Colaba", "Dadar", "Andheri", "Bandra"],
  chennai: ["Adyar", "Velachery", "T Nagar", "Saidapet"],
  bangalore: ["MG Road", "Koramangala", "Indiranagar", "HSR Layout"]
}

export default function SimulationPage() {
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineValue, setTimelineValue] = useState([0])
  const [selectedCity, setSelectedCity] = useState("mumbai")
  const [selectedZone, setSelectedZone] = useState("Colaba")
  const [disasterType, setDisasterType] = useState<keyof typeof disasterConfig>("flood")
  const [intensity, setIntensity] = useState([3])
  const [simSpeed, setSimSpeed] = useState(1)
  const [fidelity, setFidelity] = useState(true)

  const cityCoords: Record<string, [number, number]> = {
    chennai: [80.2707, 13.0827],
    mumbai: [72.8777, 19.0760],
    bangalore: [77.5946, 12.9716],
  }

  useEffect(() => {
    document.title = "TERRA | Live Simulation";
    setSelectedZone(cityZones[selectedCity][0])
  }, [selectedCity])

  // Neural Settings Link
  useEffect(() => {
    const settingsRef = ref(database, 'terra/settings')
    onValue(settingsRef, (snap) => {
      const data = snap.val()
      if (data) {
        setSimSpeed(data.simulationSpeed || 1)
        setFidelity(data.satelliteFidelity ?? true)
      }
    })
  }, [])

  // Spread and Pulse Animation Generator (GeoJSON Circle)
  const disasterOverlay = useMemo(() => {
    if (!isPlaying && timelineValue[0] === 0) return null

    const center = cityCoords[selectedCity]
    const pulseFactor = isPlaying ? (1 + Math.sin(Date.now() / 200) * 0.05) : 1
    const radius = (timelineValue[0] * intensity[0]) * 0.002 * pulseFactor
    
    const points = fidelity ? 64 : 32
    const coords = []

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * (Math.PI * 2)
      coords.push([
        center[0] + radius * Math.cos(angle),
        center[1] + radius * Math.sin(angle)
      ])
    }
    coords.push(coords[0])

    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { 
          color: disasterType === 'flood' ? '#45AFDB' : '#ef4444' 
        },
        geometry: { type: 'Polygon', coordinates: [coords] }
      }]
    }
  }, [isPlaying, timelineValue, selectedCity, intensity, disasterType, fidelity])

  // Simulation loop scaled by simSpeed
  useEffect(() => {
    let interval: any
    if (isPlaying) {
      // 500ms base / simSpeed
      const tickRate = Math.max(50, 500 / simSpeed)
      interval = setInterval(() => {
        setTimelineValue(prev => {
          const next = prev[0] + 1
          if (next >= 48) {
            setIsPlaying(false)
            return [48]
          }
          return [next]
        })
      }, tickRate)
    }
    return () => clearInterval(interval)
  }, [isPlaying, simSpeed])

  const handleSimulate = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      toast({
        title: "Simulation Initiated",
        description: `Triggering ${disasterType.toUpperCase()} event in ${selectedZone} at ${simSpeed}x velocity.`,
      })
    } else {
      setIsPlaying(false)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setTimelineValue([0])
    toast({
      title: "Tactical Reset",
      description: "Simulation parameters and map overlays cleared.",
    })
  }

  const CurrentDisasterIcon = disasterConfig[disasterType].icon

  return (
    <div className="relative h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] -m-6 overflow-hidden">
      {/* Strategic Map Background */}
      <div className="absolute inset-0 z-0">
        <TerraMap 
          center={cityCoords[selectedCity]}
          zoom={11}
          disasterOverlay={disasterOverlay}
          enable3D={fidelity}
        />
      </div>

      {/* Left Panel: Simulation Controls */}
      <div className="absolute left-6 top-6 w-80 space-y-6 z-10">
        <Card className="glass-card border-l-4 border-l-primary shadow-2xl backdrop-blur-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" />
              Tactical Override
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Command Sector</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-white/5 border-white/10 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chennai">Chennai Sector</SelectItem>
                  <SelectItem value="mumbai">Mumbai Sector</SelectItem>
                  <SelectItem value="bangalore">Bangalore Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Target Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="bg-white/5 border-white/10 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cityZones[selectedCity].map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Disaster Vector</Label>
              <Select value={disasterType} onValueChange={(v: any) => setDisasterType(v)}>
                <SelectTrigger className="bg-white/5 border-white/10 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Flood (Hydro-Risk)</SelectItem>
                  <SelectItem value="fire">Wildfire (Thermal)</SelectItem>
                  <SelectItem value="cyclone">Cyclone (Atmospheric)</SelectItem>
                  <SelectItem value="heatwave">Heatwave (Climatic)</SelectItem>
                  <SelectItem value="earthquake">Earthquake (Seismic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Event Intensity</Label>
                <Badge className="bg-primary/20 text-primary border-primary/30 h-5 px-2 text-[10px]">LEVEL {intensity[0]}</Badge>
              </div>
              <Slider 
                value={intensity} 
                onValueChange={setIntensity} 
                max={5} 
                min={1} 
                step={1}
                className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={handleSimulate}
                className={`gap-2 h-11 font-bold ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "HALT" : "SIMULATE"}
              </Button>
              <Button 
                variant="outline" 
                className="glass gap-2 h-11 hover:bg-white/10"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                RESET
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Status Overlay */}
        <Card className="glass-card backdrop-blur-3xl border-t-2 border-t-white/10">
          <CardContent className="p-4 space-y-3">
             <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-muted-foreground">Velocity: {simSpeed}x</span>
                <span className="text-primary">{disasterConfig[disasterType].label}</span>
             </div>
             <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CurrentDisasterIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground leading-tight">Active Pattern</div>
                  <div className="text-xs font-black tracking-widest text-white">{disasterType.toUpperCase()} OVERRIDE</div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Controls (Bottom) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl z-10">
        <Card className="glass-card border-white/20 shadow-2xl backdrop-blur-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center bg-white/5 px-6 py-3 rounded-xl border border-white/10 min-w-[140px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Impact Vector</span>
                <span className="text-2xl font-mono font-black text-primary tracking-tighter">T+{timelineValue[0]}h</span>
              </div>
              <div className="flex-1 space-y-4">
                <Slider 
                  value={timelineValue} 
                  onValueChange={setTimelineValue} 
                  max={48} 
                  step={1} 
                  disabled={!isPlaying}
                  className="[&_[role=slider]]:h-7 [&_[role=slider]]:w-7 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-[0_0_20px_rgba(69,175,219,0.5)]"
                />
                <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
                  <span>Current State</span>
                  <span className="text-primary">Predictive 48h Horizon</span>
                </div>
              </div>
              <div className="hidden lg:flex flex-col gap-2">
                 <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary gap-2 h-10 px-4 font-black">
                    <Cpu className="h-4 w-4" />
                    NEURAL SYNC
                 </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
