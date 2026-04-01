
"use client"

import { useState, useEffect } from "react"
import { Bell, User, CloudRain, Wind, Thermometer, Layers, RefreshCw, LogOut, Lock, Edit3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { database, ref, onValue, get } from "@/lib/firebase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Header() {
  const router = useRouter()
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [activeSector, setActiveSector] = useState("Mumbai Sector (S-2)");
  
  const [commanderName, setCommanderName] = useState<string>("Commander");
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('terra_last_read_notif') || '0');
    }
    return 0;
  });

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const weatherRef = ref(database, 'terra/weatherData');
      const snap = await get(weatherRef);
      if (snap.exists()) {
        setWeather(snap.val());
      }
    } catch (e) {
      console.error("Weather sync failed", e);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // 1. Firebase Connection Listener
    const connectedRef = ref(database, ".info/connected")
    const unsubConnection = onValue(connectedRef, (snap) => {
      setIsOnline(!!snap.val())
    })

    // 2. Settings Listener
    const sectorRef = ref(database, 'terra/settings/primarySector')
    const unsubSector = onValue(sectorRef, (snap) => {
      if (snap.exists()) setActiveSector(snap.val())
    })

    // 3. Tactical Feed Listener for Notifications
    const feedRef = ref(database, 'terra/tacticalFeed')
    const unsubFeed = onValue(feedRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedArray = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        feedArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        const latest = feedArray.slice(0, 5)
        setNotifications(latest)

        const unread = feedArray.filter(m => 
          m.priority === 'CRITICAL' && 
          new Date(m.timestamp).getTime() > lastReadTime
        ).length
        setUnreadCount(unread)
      }
    })

    // 4. Commander Name Logic
    const savedName = localStorage.getItem('terra_commander_name');
    if (savedName) setCommanderName(savedName);

    return () => {
      unsubConnection();
      unsubSector();
      unsubFeed();
    };
  }, [lastReadTime]);

  const handleSaveName = () => {
    if (newNameInput.trim()) {
      localStorage.setItem('terra_commander_name', newNameInput.trim());
      setCommanderName(newNameInput.trim());
      setIsNameDialogOpen(false);
      setNewNameInput("");
    }
  };

  const handleMarkAsRead = () => {
    const now = Date.now();
    localStorage.setItem('terra_last_read_notif', now.toString());
    setLastReadTime(now);
    setUnreadCount(0);
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    router.push("/");
  };

  const displayVal = (val: any) => {
    if (loading && !weather) return "---";
    if (val === undefined || val === null) return "N/A";
    return typeof val === 'number' ? `${val}` : val;
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
        
        <div className="hidden lg:flex flex-col gap-0 px-3">
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">{activeSector}</span>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" : "bg-destructive shadow-[0_0_8px_#ef4444]"
            )} />
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-widest opacity-60",
              isOnline ? "text-emerald-500" : "text-destructive"
            )}>
              LINK: {isOnline ? 'ACTIVE' : 'LOST'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Weather Telemetry */}
      <div className="hidden md:flex items-center gap-6 glass px-4 py-1.5 rounded-full border-white/5">
        <div className="flex items-center gap-2 group cursor-default">
          <CloudRain className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Rainfall</span>
            <span className="text-xs font-mono font-medium">{displayVal(weather?.rainfall)}mm/h</span>
          </div>
        </div>
        <Separator orientation="vertical" className="h-4 bg-white/10" />
        <div className="flex items-center gap-2 group cursor-default">
          <Wind className="h-3.5 w-3.5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Wind</span>
            <span className="text-xs font-mono font-medium">{displayVal(weather?.windSpeed)}km/h</span>
          </div>
        </div>
        <Separator orientation="vertical" className="h-4 bg-white/10" />
        <div className="flex items-center gap-2 group cursor-default">
          <Thermometer className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Temp</span>
            <span className="text-xs font-mono font-medium">{displayVal(weather?.temperature)}°C</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchWeather} className="h-6 w-6 rounded-full hover:bg-white/10 ml-2">
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <DropdownMenu onOpenChange={(open) => open && handleMarkAsRead()}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-white/5 group">
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass-card p-0 overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest">Tactical Alerts</h3>
              <Badge variant="outline" className="text-[9px] h-4">{unreadCount} New</Badge>
            </div>
            <ScrollArea className="max-h-64">
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        notif.priority === 'CRITICAL' ? "bg-destructive" : notif.priority === 'WARNING' ? "bg-amber-500" : "bg-primary"
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">{notif.priority}</span>
                      <span className="text-[8px] font-mono ml-auto opacity-40">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] leading-tight text-muted-foreground line-clamp-2">{notif.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-[10px] text-muted-foreground italic uppercase tracking-widest opacity-40">
                    No active alerts
                  </div>
                )}
              </div>
            </ScrollArea>
            <DropdownMenuItem className="p-3 justify-center text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary focus:bg-primary/10 cursor-pointer" onClick={handleMarkAsRead}>
              Acknowledge All Alerts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold leading-none group-hover:text-primary transition-colors">{commanderName}</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Sector: S-2</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-all overflow-hidden shadow-lg shadow-primary/5">
                 <User className="h-5 w-5 text-primary" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card mt-2">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tactical Identity</DropdownMenuLabel>
            <DropdownMenuItem className="gap-3 py-2 cursor-pointer" onClick={() => { setNewNameInput(commanderName); setIsNameDialogOpen(true); }}>
              <Edit3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold">Edit Callsign</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2 cursor-pointer" onClick={() => router.push("/authority-input")}>
              <Lock className="h-4 w-4 text-destructive" />
              <span className="text-xs font-bold">Authority Input</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="gap-3 py-2 cursor-pointer text-destructive focus:bg-destructive/10" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-bold">Neural Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Commander Registration Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="glass-card sm:max-w-[425px] border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              Update Tactical Identity
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Callsign</label>
              <Input
                id="name"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                placeholder="Enter callsign..."
                className="bg-white/5 border-white/10 h-12 font-bold focus:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} className="w-full bg-primary hover:bg-primary/90 font-black uppercase tracking-widest h-12 gap-2 shadow-xl shadow-primary/20">
              <Check className="h-4 w-4" />
              Sync Neural Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
