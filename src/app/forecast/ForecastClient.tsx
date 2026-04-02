"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TerraMap } from "@/components/map/TerraMap"
import { 
  Activity, 
  Loader2, 
  Globe, 
  AlertTriangle, 
  CloudRain, 
  Clock, 
  Thermometer, 
  ChevronRight,
  Zap,
  ShieldAlert,
  TrendingUp,
  Info,
  Wind,
  Droplets,
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { database, ref, onValue } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const INITIAL_FORECAST = {
  summary: "Awaiting neural projection. Synchronize AI Forecast to generate tactical timeline.",
  modelFidelity: 0,
  primaryRisk: "Standby",
  targetZone: "Standby",
  immediateAction: "Monitoring",
  hourlyForecast: []
}

export function ForecastClient() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [forecast, setForecast] = useState<any>(INITIAL_FORECAST)
  const [expandedCard, setExpandedCard] = useState<number | null>(0)
  const [isProtocolOpen, setIsProtocolOpen] = useState(false)
  const [activeDisaster, setActiveDisaster] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    const forecastRef = ref(database, 'terra/forecast')
    const unsubForecast = onValue(forecastRef, (snapshot) => {
      if (snapshot.exists()) setForecast(snapshot.val())
    })

    const disasterRef = ref(database, 'terra/activeDisaster')
    const unsubDisaster = onValue(disasterRef, (snapshot) => {
      if (snapshot.exists()) setActiveDisaster(snapshot.val())
    })

    const weatherRef = ref(database, 'terra/weatherData')
    const unsubWeather = onValue(weatherRef, (snapshot) => {
      if (snapshot.exists()) setWeather(snapshot.val())
    })

    return () => {
      unsubForecast()
      unsubDisaster()
      unsubWeather()
    }
  }, [])

  const handleSyncForecast = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-forecast', { method: 'POST' })
      if (!res.ok) throw new Error('Neural sync failed')
      
      toast({
        title: "Forecast Synchronized",
        description: "Neural AI has projected a fresh 6-hour tactical timeline.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not establish connection to AI prediction clusters.",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateProtocols = (action: string) => {
    return [
      `Analyze Action Directive: ${action}`,
      "Deploy rapid response units to marked target zones.",
      "Activate local drainage bypass mechanisms.",
      "Broadcast evacuation directives to citizen nodes.",
      "Monitor structural integrity of key levees."
    ]
  }

  const getSeverityColor = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  }

  const timelineData = forecast.hourlyForecast || []

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">Prediction Timeline</h1>
            <p className="text-muted-foreground text-sm font-medium">Neural Predictive Modeling: {activeDisaster?.sector || 'Global'}</p>
          </div>
        </div>
        <Button 
          onClick={handleSyncForecast} 
          disabled={loading} 
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-8 font-black uppercase tracking-widest text-[10px]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {loading ? "SYNCING..." : "SYNC AI FORECAST"}
        </Button>
      </div>

      <Card className="glass-card border-l-4 border-l-primary overflow-hidden shadow-2xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between bg-white/5 border-b border-white/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Neural Assessment Summary
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[9px] font-mono">
            Model Fidelity: {forecast.modelFidelity || 0}%
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Primary Risk Vector</span>
              <div className="flex items-center gap-2 text-xl font-black text-destructive uppercase italic">
                <AlertTriangle className="h-5 w-5" />
                {forecast.primaryRisk || activeDisaster?.type || "Standby"}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                {timelineData.length > 0 
                  ? `Predicted severity peaked at ${Math.max(...timelineData.map((h:any) => h.predictedSeverityPercent || 0))}% over horizon.`
                  : "Sync AI to analyze severity peaks."}
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Target Zone</span>
              <div className="text-xl font-black text-white flex items-center gap-2 uppercase italic">
                <Globe className="h-5 w-5 text-primary opacity-50" />
                {forecast.targetZone || activeDisaster?.sector || "Global"}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Impact sensitivity calibrated for tactical basin profile.</p>
            </div>
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Immediate Action</span>
              <div className="text-xl font-black text-accent flex items-center gap-2 uppercase italic">
                <ShieldAlert className="h-5 w-5 opacity-50" />
                {forecast.immediateAction || "Monitoring"}
              </div>
              <Button 
                variant="link" 
                onClick={() => setIsProtocolOpen(true)}
                className="p-0 h-auto text-[10px] text-accent font-black uppercase gap-1 group tracking-widest"
              >
                View Protocol <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 relative min-h-[350px] rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
        <TerraMap 
          center={activeDisaster?.sector?.includes('Mumbai') ? [72.8777, 19.0760] : [72.8777, 19.0760]}
          zoom={12}
          markers={[
            { id: 'p1', coordinates: [72.8777, 19.0760], type: 'incident', severity: 'high', label: forecast.targetZone || activeDisaster?.sector || 'Active Sector' }
          ]}
        />
        <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs space-y-2 pointer-events-none transition-all duration-500">
          <div className="text-[10px] font-black uppercase text-primary tracking-widest">Model Projection Detail</div>
          <p className="text-[11px] leading-relaxed text-muted-foreground font-medium italic">
            {forecast.summary}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            6-Hour Predictive Vector
          </h3>
          <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[9px] gap-1.5 px-3 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {timelineData.length > 0 ? "NEURAL PROJECTION ACTIVE" : "AWAITING SYNC"}
          </Badge>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-4">
            {timelineData.length > 0 ? timelineData.map((item: any, i: number) => {
              const isActive = expandedCard === i;
              return (
                <Card 
                  key={i} 
                  onClick={() => setExpandedCard(i)}
                  className={`glass-card min-w-[240px] transition-all duration-300 cursor-pointer border-t-2 group ${
                    isActive ? 'border-t-primary bg-primary/10 shadow-[0_0_30px_rgba(69,175,219,0.1)]' : 'border-t-white/5 hover:border-t-primary/40'
                  }`}
                >
                  <CardHeader className="p-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                    <span className="text-sm font-black text-white font-mono">{item.hour}</span>
                    <Badge variant="outline" className={`text-[8px] h-4 uppercase font-bold ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Rainfall</span>
                        <div className="flex items-center gap-2">
                          <CloudRain className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-black font-mono text-white">{item.rainfall}mm/h</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Atmosphere</span>
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-black font-mono text-white">{item.temperature}°C</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Severity Vector</span>
                        <span className={`text-[10px] font-black font-mono ${item.predictedSeverityPercent > 80 ? 'text-destructive' : 'text-primary'}`}>
                          {item.predictedSeverityPercent}%
                        </span>
                      </div>
                      <Progress value={item.predictedSeverityPercent} className={`h-1 ${item.predictedSeverityPercent > 80 ? '[&>div]:bg-destructive' : ''}`} />
                    </div>

                    {isActive && (
                      <div className="pt-4 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wind className="h-3 w-3 text-accent" />
                            <span className="text-[9px] font-bold uppercase text-muted-foreground">Wind Speed</span>
                          </div>
                          <span className="text-[10px] font-mono font-black text-accent">{item.windSpeed || 0} km/h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-bold uppercase text-muted-foreground">Drainage Load</span>
                          </div>
                          <span className="text-[10px] font-mono font-black text-primary">{item.drainageLoad || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-destructive" />
                            <span className="text-[9px] font-bold uppercase text-muted-foreground">Evac Urgency</span>
                          </div>
                          <Badge variant="outline" className="text-[8px] border-destructive/20 text-destructive bg-destructive/5 font-black">
                            {item.evacuationUrgency || 'LOW'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            }) : (
              <div className="w-full flex flex-col items-center justify-center p-12 glass border border-dashed border-white/10 rounded-2xl opacity-40">
                <Zap className="h-8 w-8 mb-2 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest">Run AI Forecast to generate timeline vector</p>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Dialog open={isProtocolOpen} onOpenChange={setIsProtocolOpen}>
        <DialogContent className="glass-card sm:max-w-[450px] border-accent/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-accent" />
              Emergency Response Protocol
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <span className="text-[10px] font-black uppercase text-accent tracking-widest mb-1 block">Primary Objective</span>
              <p className="text-sm font-bold text-white italic">"{forecast.immediateAction || "Standard Observation"}"</p>
            </div>
            <div className="space-y-3">
              {generateProtocols(forecast.immediateAction || "Monitor Sector Status").map((step, idx) => (
                <div key={idx} className="flex gap-4 items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-black text-accent shrink-0 border border-accent/30">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProtocolOpen(false)} className="w-full bg-accent hover:bg-accent/90 font-black uppercase tracking-widest h-12">
              DISMISS PROTOCOL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
