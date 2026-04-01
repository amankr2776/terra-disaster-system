"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database, ref, set, push, serverTimestamp } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ShieldAlert, 
  CloudRain, 
  Bell, 
  Tent, 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  Radio,
  Lock,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function AuthorityInputPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Section 1: Active Disaster
  const [disaster, setDisaster] = useState({
    type: "flood",
    severity: "CRITICAL",
    sector: "Sector 4, Mumbai",
    affectedPopulation: 842500,
    evacuationPercent: 42,
    drainageCapacity: 94,
    minutesToInundation: 22
  })

  // Section 2: Weather Data
  const [weather, setWeather] = useState({
    rainfall: 12,
    windSpeed: 45,
    temperature: 28
  })

  // Section 3: Post Notification
  const [notification, setNotification] = useState({
    message: "",
    priority: "WARNING"
  })

  // Section 4: Relief Camps
  const [camps, setCamps] = useState([
    { name: "City Central School", distance: "0.8", capacityPercent: 80 }
  ])

  useEffect(() => {
    document.title = "TERRA | Authority Command";
    const authStatus = sessionStorage.getItem('terra_auth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setIsAuthDialogOpen(false)
    }
  }, [])

  const handlePasswordSubmit = () => {
    const correctPassword = process.env.NEXT_PUBLIC_AUTHORITY_PASSWORD || "terra-admin-2024"
    if (password === correctPassword) {
      sessionStorage.setItem('terra_auth', 'true')
      setIsAuthenticated(true)
      setIsAuthDialogOpen(false)
      toast({
        title: "Access Granted",
        description: "Authority tactical link established.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials. Incident reported.",
      })
      router.push('/dashboard')
    }
  }

  const broadcastNotification = async () => {
    if (!notification.message.trim()) return
    
    try {
      const feedRef = ref(database, 'terra/tacticalFeed')
      await push(feedRef, {
        message: notification.message,
        priority: notification.priority,
        timestamp: new Date().toISOString(),
        source: "authority"
      })
      
      setNotification({ ...notification, message: "" })
      toast({
        title: "Notification Broadcast",
        description: "Message pushed to all active citizen and commander nodes.",
      })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Broadcast Failed" })
    }
  }

  const addCamp = () => {
    if (camps.length < 5) {
      setCamps([...camps, { name: "", distance: "", capacityPercent: 0 }])
    }
  }

  const removeCamp = (index: number) => {
    const newCamps = camps.filter((_, i) => i !== index)
    setCamps(newCamps)
  }

  const saveCamps = async () => {
    try {
      const campsRef = ref(database, 'terra/reliefCamps')
      await set(campsRef, camps)
      toast({ title: "Camps Updated", description: "Relief camp inventory synchronized." })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Save Failed" })
    }
  }

  const pushLiveUpdate = async () => {
    setIsUpdating(true)
    try {
      // 1. Update Active Disaster
      const disasterRef = ref(database, 'terra/activeDisaster')
      await set(disasterRef, {
        ...disaster,
        lastUpdated: serverTimestamp()
      })

      // 2. Update Weather Data
      const weatherRef = ref(database, 'terra/weatherData')
      await set(weatherRef, {
        ...weather,
        lastUpdated: serverTimestamp()
      })

      // 3. Trigger AI Analysis
      await fetch('/api/ai-analyze', { method: 'POST' })

      toast({
        title: "Strategic Push Complete",
        description: "Data synchronized and AI analysis triggered.",
      })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Push Failed" })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={isAuthDialogOpen}>
        <DialogContent className="glass-card sm:max-w-[425px] border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              Authority Verification
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pass" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tactical Access Key</Label>
              <Input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="bg-white/5 border-white/10 h-12 font-bold"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit} className="w-full bg-primary hover:bg-primary/90 font-black uppercase tracking-widest h-12">
              Unlock Terminal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
            <Radio className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">Live Authority Input</h1>
            <p className="text-muted-foreground text-sm font-medium italic">Direct Neural Link to Firebase Global Backbone</p>
          </div>
        </div>
        <Button 
          onClick={pushLiveUpdate} 
          disabled={isUpdating}
          className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-14 px-10 font-black uppercase tracking-widest text-sm rounded-xl gap-3"
        >
          {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {isUpdating ? "SYNCHRONIZING..." : "PUSH LIVE UPDATE"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Active Disaster */}
        <Card className="glass-card border-t-4 border-t-destructive">
          <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-destructive">
              <ShieldAlert className="h-4 w-4" />
              Active Disaster Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Disaster Type</Label>
                <Select value={disaster.type} onValueChange={(v) => setDisaster({ ...disaster, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="cyclone">Cyclone</SelectItem>
                    <SelectItem value="earthquake">Earthquake</SelectItem>
                    <SelectItem value="drought">Drought</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Severity</Label>
                <Select value={disaster.severity} onValueChange={(v) => setDisaster({ ...disaster, severity: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">LOW</SelectItem>
                    <SelectItem value="MODERATE">MODERATE</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sector / Location</Label>
              <Input 
                value={disaster.sector} 
                onChange={(e) => setDisaster({ ...disaster, sector: e.target.value })}
                className="bg-white/5 border-white/10 font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Affected Population</Label>
              <Input 
                type="number"
                value={disaster.affectedPopulation} 
                onChange={(e) => setDisaster({ ...disaster, affectedPopulation: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 font-mono font-bold"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Evacuation % Verified</Label>
                <span className="text-xs font-black text-primary">{disaster.evacuationPercent}%</span>
              </div>
              <Slider 
                value={[disaster.evacuationPercent]} 
                onValueChange={(v) => setDisaster({ ...disaster, evacuationPercent: v[0] })}
                max={100}
                className="[&_[role=slider]]:border-primary"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Infrastructure Capacity %</Label>
                <span className="text-xs font-black text-accent">{disaster.drainageCapacity}%</span>
              </div>
              <Slider 
                value={[disaster.drainageCapacity]} 
                onValueChange={(v) => setDisaster({ ...disaster, drainageCapacity: v[0] })}
                max={100}
                className="[&_[role=slider]]:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Minutes to Threshold</Label>
              <Input 
                type="number"
                value={disaster.minutesToInundation} 
                onChange={(e) => setDisaster({ ...disaster, minutesToInundation: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 2: Weather Data */}
          <Card className="glass-card border-t-4 border-t-primary">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                <CloudRain className="h-4 w-4" />
                Live Atmospheric Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 pt-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase opacity-60">Rainfall (mm/h)</Label>
                <Input 
                  type="number" 
                  value={weather.rainfall} 
                  onChange={(e) => setWeather({ ...weather, rainfall: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase opacity-60">Wind (km/h)</Label>
                <Input 
                  type="number" 
                  value={weather.windSpeed} 
                  onChange={(e) => setWeather({ ...weather, windSpeed: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase opacity-60">Temp (°C)</Label>
                <Input 
                  type="number" 
                  value={weather.temperature} 
                  onChange={(e) => setWeather({ ...weather, temperature: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 font-mono font-bold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Post Notification */}
          <Card className="glass-card border-t-4 border-t-amber-500">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500">
                <Bell className="h-4 w-4" />
                Broadcast Tactical Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Textarea 
                placeholder="Enter critical instruction or status update..."
                value={notification.message}
                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                className="bg-white/5 border-white/10 h-24 text-sm font-medium"
              />
              <div className="flex gap-4">
                <Select value={notification.priority} onValueChange={(v) => setNotification({ ...notification, priority: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                    <SelectItem value="WARNING">WARNING</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={broadcastNotification} className="bg-amber-500 hover:bg-amber-600 font-bold uppercase text-[10px] tracking-widest px-8">
                  BROADCAST
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Relief Camps */}
          <Card className="glass-card border-t-4 border-t-emerald-500">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500">
                <Tent className="h-4 w-4" />
                Relief Camp Inventory
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={addCamp} className="h-7 w-7 glass border-emerald-500/30 text-emerald-500">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" onClick={saveCamps} className="h-7 w-7 glass border-emerald-500/30 text-emerald-500">
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {camps.map((camp, i) => (
                <div key={i} className="flex gap-3 items-end group">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[8px] font-black uppercase opacity-40">Camp Name</Label>
                    <Input 
                      value={camp.name} 
                      onChange={(e) => {
                        const newCamps = [...camps]
                        newCamps[i].name = e.target.value
                        setCamps(newCamps)
                      }}
                      className="bg-white/5 border-white/10 h-8 text-[11px] font-bold"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[8px] font-black uppercase opacity-40">Dist (km)</Label>
                    <Input 
                      value={camp.distance} 
                      onChange={(e) => {
                        const newCamps = [...camps]
                        newCamps[i].distance = e.target.value
                        setCamps(newCamps)
                      }}
                      className="bg-white/5 border-white/10 h-8 text-[11px] font-mono"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[8px] font-black uppercase opacity-40">Cap %</Label>
                    <Input 
                      type="number"
                      value={camp.capacityPercent} 
                      onChange={(e) => {
                        const newCamps = [...camps]
                        newCamps[i].capacityPercent = parseInt(e.target.value)
                        setCamps(newCamps)
                      }}
                      className="bg-white/5 border-white/10 h-8 text-[11px] font-mono"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCamp(i)} 
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {camps.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic text-center py-4">No active relief camps defined.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
