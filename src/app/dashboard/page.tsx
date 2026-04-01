
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

export default function DashboardPage() {
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      
      if (data.error) {
        setError(true);
        if (data.telemetry) setWeather(data.telemetry);
      } else {
        setWeather(data.telemetry);
        setError(false);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayVal = (val: string | undefined) => {
    if (loadingWeather && !weather) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (error || !val || val === "N/A") return "N/A";
    return val;
  };

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
              <Badge variant="outline" className={`text-[10px] ${error ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/10 border-primary/20 text-primary'} gap-1.5 px-2`}>
                <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-destructive' : 'bg-primary'} animate-pulse`} />
                {error ? 'Satellite Link Degraded' : 'Live Subcontinent Grid'}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Mumbai Sector | T-Zero Sync</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-4">
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Precipitation</div>
                <div className="text-lg font-mono font-bold text-primary leading-none">
                  {displayVal(weather?.rainfall)}
                </div>
             </div>
             <CloudRain className="h-5 w-5 text-primary opacity-50" />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Wind Speed</div>
                <div className="text-lg font-mono font-bold text-accent leading-none">
                  {displayVal(weather?.windSpeed)}
                </div>
             </div>
             <Wind className="h-5 w-5 text-accent opacity-50" />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Atmosphere</div>
                <div className="text-lg font-mono font-bold text-amber-500 leading-none">
                  {displayVal(weather?.temperature)}
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
              { id: '1', coordinates: [72.8777, 19.0760], type: 'incident', severity: 'high', label: 'Primary Surge Point' },
              { id: '2', coordinates: [72.8250, 19.0500], type: 'incident', severity: 'medium', label: 'Localized Overflow' },
              { id: '3', coordinates: [72.8500, 19.1000], type: 'resource', label: 'Strike Team Bravo' }
            ]}
          />
          <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs space-y-3 pointer-events-none">
             <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-black uppercase italic tracking-widest">Active Analysis</span>
             </div>
             <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                SOMA District drainage system at <span className="text-primary font-bold">94% capacity</span>. Projected inundation of Sector 4 within 22 minutes.
             </p>
          </div>
        </div>

        {/* Intelligence Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          <Card className="glass-card border-t-4 border-t-destructive shadow-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Strategic Threat</CardTitle>
                <Badge variant="destructive" className="animate-pulse text-[9px] px-2 h-5">CRITICAL ESCALATION</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="text-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Affected Population</div>
                  <div className="text-4xl font-black tracking-tighter text-white">842,500</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <Users className="h-3 w-3 text-primary" />
                     <span className="text-[10px] font-mono text-primary font-bold">42% Evacuation Verified</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                    <span>Sector Integrity</span>
                    <span className="text-destructive font-mono">22% DEPLETION</span>
                  </div>
                  <Progress value={78} className="h-1.5 [&>div]:bg-destructive" />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                     <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Resource Load</span>
                     <span className="text-xl font-bold text-accent">92.4%</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                     <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1">System Health</span>
                     <span className={`text-xl font-bold ${error ? 'text-destructive' : 'text-emerald-500'}`}>{error ? 'DEGRADED' : 'OPTIMAL'}</span>
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
                  {[
                    { type: 'alert', text: "Levee breach confirmed at Sector 4 North.", time: "09:42", level: "critical" },
                    { type: 'update', text: "Strike Team Bravo deployed to Marine Drive.", time: "09:40", level: "info" },
                    { type: 'alert', text: "High tide synchronization detected. Coastal risk +20%.", time: "09:38", level: "warning" },
                    { type: 'status', text: "Neural Link: Bangalore node synchronized.", time: "09:35", level: "info" },
                    { type: 'alert', text: "Emergency broadcast initiated for SOMA District.", time: "09:32", level: "warning" }
                  ].map((alert, i) => (
                    <div key={i} className="p-4 hover:bg-white/5 transition-colors cursor-default group">
                       <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-1.5 ${
                            alert.level === 'critical' ? 'bg-destructive/20 text-destructive' :
                            alert.level === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                          }`}>
                            <CircleAlert className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium leading-relaxed group-hover:text-white transition-colors">{alert.text}</p>
                            <span className="text-[9px] font-mono text-muted-foreground mt-1 block">{alert.time} • PRIORITY: {alert.level.toUpperCase()}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
