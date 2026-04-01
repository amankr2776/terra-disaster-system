
"use client"

import { useState, useEffect } from "react"
import { Bell, User, CloudRain, Wind, Thermometer, Layers, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function Header() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayVal = (val: string | undefined) => {
    if (loading && !weather) return "---";
    if (error || !val || val === "N/A") return "N/A";
    return val;
  };

  return (
    <header className="h-16 border-b border-white/10 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden hover:bg-white/10" />
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(69,175,219,0.2)]">
            <Layers className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white hidden sm:block">TERRA</span>
        </div>
        
        <Separator orientation="vertical" className="h-6 bg-white/10 hidden md:block" />
        
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-destructive' : 'bg-primary'} animate-pulse`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            System: {loading ? 'Syncing...' : error ? 'Degraded' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* Center: Weather Telemetry */}
      <div className="hidden md:flex items-center gap-6 glass px-4 py-1.5 rounded-full border-white/5">
        <div className="flex items-center gap-2 group cursor-default">
          <CloudRain className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Rainfall</span>
            <span className="text-xs font-mono font-medium">{displayVal(weather?.rainfall)}</span>
          </div>
        </div>
        <Separator orientation="vertical" className="h-4 bg-white/10" />
        <div className="flex items-center gap-2 group cursor-default">
          <Wind className="h-3.5 w-3.5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Wind</span>
            <span className="text-xs font-mono font-medium">{displayVal(weather?.windSpeed)}</span>
          </div>
        </div>
        <Separator orientation="vertical" className="h-4 bg-white/10" />
        <div className="flex items-center gap-2 group cursor-default">
          <Thermometer className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Temp</span>
            <span className="text-xs font-mono font-medium">{displayVal(weather?.temperature)}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchWeather} className="h-6 w-6 rounded-full hover:bg-white/10 ml-2">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-white/5 group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-bounce" />
        </Button>
        
        <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />
        
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold leading-none group-hover:text-primary transition-colors">Commander Sarah</span>
            <span className="text-[10px] text-muted-foreground font-mono">ID: X-4410</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-all overflow-hidden">
             <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  )
}
