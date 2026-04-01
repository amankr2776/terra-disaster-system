
"use client"

import { useState, useEffect } from "react"
import { Bell, User, CloudRain, Wind, Thermometer, Layers, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { database, ref, onValue } from "@/lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function Header() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  
  const [commanderName, setCommanderName] = useState<string>("Commander");
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      setWeather(data.telemetry || null);
    } catch (e) {
      console.error("Weather sync failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // 1. Firebase Connection Listener
    const connectedRef = ref(database, ".info/connected")
    const unsubConnection = onValue(connectedRef, (snap) => {
      setIsOnline(!!snap.val())
    })

    // 2. Commander Name Logic
    const savedName = localStorage.getItem('terra_commander_name');
    if (savedName) {
      setCommanderName(savedName);
    } else {
      setIsNameDialogOpen(true);
    }

    const interval = setInterval(fetchWeather, 60000);
    return () => {
      clearInterval(interval);
      unsubConnection();
    };
  }, []);

  const handleSaveName = () => {
    if (newNameInput.trim()) {
      localStorage.setItem('terra_commander_name', newNameInput.trim());
      setCommanderName(newNameInput.trim());
      setIsNameDialogOpen(false);
    }
  };

  const displayVal = (val: string | undefined) => {
    if (loading && !weather) return "---";
    if (!val || val === "N/A") return "N/A";
    return val;
  };

  return (
    <header className="h-16 border-b border-white/10 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-white/10" />
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(69,175,219,0.2)]">
            <Layers className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white hidden sm:block">TERRA</span>
        </div>
        
        <Separator orientation="vertical" className="h-6 bg-white/10 hidden md:block" />
        
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" : "bg-destructive shadow-[0_0_8px_#ef4444]"
          )} />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isOnline ? "text-emerald-500" : "text-destructive"
          )}>
            System: {isOnline ? 'Online' : 'Offline'}
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
        
        <div className="flex items-center gap-3 pl-2 cursor-pointer group" onClick={() => setIsNameDialogOpen(true)}>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold leading-none group-hover:text-primary transition-colors">{commanderName}</span>
            <span className="text-[10px] text-muted-foreground font-mono">ID: X-PROX</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-all overflow-hidden">
             <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Commander Registration Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="glass-card sm:max-w-[425px] border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Register Commander</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tactical Callsign</label>
              <Input
                id="name"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                placeholder="Enter callsign..."
                className="bg-white/5 border-white/10 h-12 font-bold"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} className="w-full bg-primary hover:bg-primary/90 font-black uppercase tracking-widest h-12">
              Sync Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
