"use client"

import { useState } from "react"
import { generateDisasterForecast, type GenerateDisasterForecastInput, type GenerateDisasterForecastOutput } from "@/ai/flows/generate-disaster-forecast"
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
  TrendingUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const initialTimeline = [
  { label: "Now", rainfall: "8.2mm", severity: 45, temp: "24°C", risk: "Warning" },
  { label: "+1hr", rainfall: "15.4mm", severity: 82, temp: "22°C", risk: "Critical" },
  { label: "+2hr", rainfall: "20.1mm", severity: 94, temp: "21°C", risk: "Critical" },
  { label: "+3hr", rainfall: "12.5mm", severity: 70, temp: "22°C", risk: "High" },
  { label: "+4hr", rainfall: "4.2mm", severity: 30, temp: "23°C", risk: "Warning" },
  { label: "+6hr", rainfall: "1.2mm", severity: 15, temp: "24°C", risk: "Low" },
]

export default function ForecastPage() {
  const [loading, setLoading] = useState(false)
  const [forecastResult, setForecastResult] = useState<GenerateDisasterForecastOutput | null>(null)
  
  const [inputs] = useState<GenerateDisasterForecastInput>({
    regionDescription: "Bangalore Metropolitan Area",
    currentWeatherPatterns: "Localized heavy convection, risk of urban flash flooding",
    historicalWeatherData: "Increased frequency of extreme rainfall events during monsoon",
    currentSeismicActivity: "Quiet",
    historicalSeismicData: "Stable",
    currentGeographicConditions: "Rapid urbanization causing reduced infiltration",
    historicalDisasterEvents: "2022 Urban Flooding",
  })

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateDisasterForecast(inputs)
      setForecastResult(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const timeline = forecastResult?.timeline || initialTimeline

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prediction Timeline</h1>
            <p className="text-muted-foreground">Neural predictive modeling: Bangalore Strategic Sector</p>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="gap-2 bg-primary shadow-lg shadow-primary/20 h-11 px-6 font-bold uppercase tracking-wider">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {loading ? "Syncing..." : "Sync AI Forecast"}
        </Button>
      </div>

      {/* Top: Summary Section */}
      <Card className="glass-card border-l-4 border-l-primary overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between bg-white/5">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Neural Assessment Summary
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px]">Model Fidelity: 99.4%</Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.1em]">Primary Risk Vector</span>
              <div className="flex items-center gap-2 text-xl font-bold text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Drainage Failure
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Projected stormwater overflow: <span className="text-white font-bold">92% capacity</span> at peak rainfall.</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.1em]">Target Zone</span>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary opacity-50" />
                Sector 3 (Civic)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Density-weighted impact: <span className="text-white font-bold">High (Level 4)</span></p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.1em]">Immediate Action</span>
              <div className="text-xl font-bold text-accent flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 opacity-50" />
                Mobilize Rapid Teams
              </div>
              <Button variant="link" className="p-0 h-auto text-[10px] text-accent font-bold uppercase gap-1 group">
                View Protocol <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Center: Map Prediction View */}
      <div className="flex-1 relative min-h-[400px] rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
        <TerraMap 
          center={[77.5946, 12.9716]} // Bangalore
          zoom={12}
          markers={[
            { id: 'p1', coordinates: [77.5946, 12.9716], type: 'incident', severity: 'high', label: 'Primary Inundation Point' },
            { id: 'p2', coordinates: [77.6200, 12.9500], type: 'incident', severity: 'medium', label: 'Secondary Runoff' }
          ]}
        />
        <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs space-y-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-[10px] font-bold uppercase text-primary">Map Prediction View</div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">The AI model projects critical flooding starting from the eastern basin, expanding west over the next 3 hours.</p>
        </div>
      </div>

      {/* Bottom: Timeline Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            6-Hour Predictive Vector
          </h3>
          {forecastResult && (
            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[9px] gap-1.5 px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI ESCALATION WARNING ACTIVE
            </Badge>
          )}
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-4">
            {timeline.map((item: any, i: number) => (
              <Card key={i} className="glass-card min-w-[240px] hover:bg-white/5 transition-all group border-t-2 border-t-white/5 hover:border-t-primary/50">
                <CardHeader className="p-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                  <span className="text-sm font-bold text-white font-mono">{item.label}</span>
                  <Badge variant="outline" className={`text-[8px] h-4 uppercase ${
                      item.risk === 'Critical' || item.risk === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      item.risk === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {item.risk}
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Rainfall</span>
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-bold font-mono text-white">{item.rainfall}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Atmosphere</span>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-sm font-bold font-mono text-white">{item.temp}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Predicted Severity</span>
                      <span className={`text-[10px] font-bold font-mono ${item.severity > 80 ? 'text-destructive' : 'text-primary'}`}>{item.severity}%</span>
                    </div>
                    <Progress value={item.severity} className={`h-1.5 ${item.severity > 80 ? '[&>div]:bg-destructive' : ''}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Intelligence Expansion */}
      {forecastResult && (
        <Card className="glass-card border-t-2 border-t-accent shadow-2xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Strategic Model Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground font-medium">
              {forecastResult.summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
