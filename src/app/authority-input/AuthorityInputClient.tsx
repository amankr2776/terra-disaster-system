"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database, ref, push } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ShieldAlert, 
  CloudRain, 
  Tent, 
  Zap, 
  Plus, 
  Trash2, 
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

const DB_URL = "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app";

export function AuthorityInputClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const [disaster, setDisaster] = useState({
    type: "flood",
    severity: "CRITICAL",
    sector: "Sector 4, Mumbai",
    affectedPopulation: 842500,
    evacuationPercent: 42,
    drainageCapacity: 94,
    minutesToInundation: 22
  })

  const [weather, setWeather] = useState({
    rainfall: 12,
    windSpeed: 45,
    temperature: 28
  })

  const [camps, setCamps] = useState([
    { name: "City Central School", distance: "0.8", capacityPercent: 80 }
  ])

  useEffect(() => {
    const authStatus = sessionStorage.getItem('terra_auth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setIsAuthDialogOpen(false)
    }
  }, [])

  const handlePasswordSubmit = () => {
    const correctPassword = "terra-admin-2024"
    if (password === correctPassword) {
      sessionStorage.setItem('terra_auth', 'true')
      setIsAuthenticated(true)
      setIsAuthDialogOpen(false)
      toast({ title: "Access Granted" })
    } else {
      toast({ variant: "destructive", title: "Access Denied" })
      router.push('/dashboard')
    }
  }

  const addCamp = () => {
    if (camps.length < 5) setCamps([...camps, { name: "", distance: "", capacityPercent: 0 }])
  }

  const removeCamp = (index: number) => setCamps(camps.filter((_, i) => i !== index))

  const pushLiveUpdate = async () => {
    setIsUpdating(true)
    try {
      const timestamp = new Date().toISOString()
      await Promise.all([
        fetch(`${DB_URL}/terra/activeDisaster.json`, { method: "PUT", body: JSON.stringify({ ...disaster, lastUpdated: timestamp }), headers: { "Content-Type": "application/json" } }),
        fetch(`${DB_URL}/terra/weatherData.json`, { method: "PUT", body: JSON.stringify({ ...weather, lastUpdated: timestamp }), headers: { "Content-Type": "application/json" } }),
        fetch(`${DB_URL}/terra/reliefCamps.json`, { method: "PUT", body: JSON.stringify(camps), headers: { "Content-Type": "application/json" } })
      ])
      await fetch('/api/ai-analyze', { method: 'POST' })
      toast({ title: "Strategic Push Complete" })
    } catch (error) { toast({ variant: "destructive", title: "Push Failed" }) }
    finally { setIsUpdating(false) }
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={isAuthDialogOpen}>
        <DialogContent className="glass-card sm:max-w-[425px]">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase flex items-center gap-3"><Lock className="h-5 w-5 text-primary" /> Authority Verification</DialogTitle></DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-xs uppercase font-black text-muted-foreground">Tactical Access Key</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 h-12 font-bold" onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} />
          </div>
          <DialogFooter><Button onClick={handlePasswordSubmit} className="w-full bg-primary font-black h-12">Unlock Terminal</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl border border-primary/30"><Radio className="h-7 w-7 text-primary animate-pulse" /></div>
          <div><h1 className="text-3xl font-black uppercase italic">Live Authority Input</h1><p className="text-muted-foreground text-sm italic">Direct Neural Link to Firebase Backbone</p></div>
        </div>
        <Button onClick={pushLiveUpdate} disabled={isUpdating} className="bg-primary hover:bg-primary/90 h-14 px-10 font-black rounded-xl gap-3">
          {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {isUpdating ? "SYNCHRONIZING..." : "PUSH LIVE UPDATE"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card border-t-4 border-t-destructive">
          <CardHeader className="pb-4 border-b border-white/5 bg-white/5"><CardTitle className="text-xs font-black uppercase tracking-widest text-destructive flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Active Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-60">Disaster Type</Label>
                <Select value={disaster.type} onValueChange={(v) => setDisaster({ ...disaster, type: v })}><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="flood">Flood</SelectItem><SelectItem value="cyclone">Cyclone</SelectItem><SelectItem value="earthquake">Earthquake</SelectItem><SelectItem value="drought">Drought</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-60">Severity</Label>
                <Select value={disaster.severity} onValueChange={(v) => setDisaster({ ...disaster, severity: v })}><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="LOW">LOW</SelectItem><SelectItem value="MODERATE">MODERATE</SelectItem><SelectItem value="HIGH">HIGH</SelectItem><SelectItem value="CRITICAL">CRITICAL</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] uppercase opacity-60">Sector / Location</Label><Input value={disaster.sector} onChange={(e) => setDisaster({ ...disaster, sector: e.target.value })} className="bg-white/5 font-bold" /></div>
            <div className="space-y-2"><Label className="text-[10px] uppercase opacity-60">Population</Label><Input type="number" value={disaster.affectedPopulation || 0} onChange={(e) => setDisaster({ ...disaster, affectedPopulation: parseInt(e.target.value) || 0 })} className="bg-white/5 font-mono font-bold" /></div>
            <div className="space-y-4"><div className="flex justify-between"><Label className="text-[10px] uppercase opacity-60">Evacuation %</Label><span className="text-xs font-black text-primary">{disaster.evacuationPercent}%</span></div><Slider value={[disaster.evacuationPercent]} onValueChange={(v) => setDisaster({ ...disaster, evacuationPercent: v[0] })} max={100} /></div>
            <div className="space-y-4"><div className="flex justify-between"><Label className="text-[10px] uppercase opacity-60">Drainage Capacity %</Label><span className="text-xs font-black text-accent">{disaster.drainageCapacity}%</span></div><Slider value={[disaster.drainageCapacity]} onValueChange={(v) => setDisaster({ ...disaster, drainageCapacity: v[0] })} max={100} /></div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-card border-t-4 border-t-primary">
            <CardHeader className="pb-4 bg-white/5"><CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-2"><CloudRain className="h-4 w-4" /> Atmospherics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 pt-6">
              <div className="space-y-2"><Label className="text-[9px] uppercase">Rain (mm/h)</Label><Input type="number" value={weather.rainfall || 0} onChange={(e) => setWeather({ ...weather, rainfall: parseInt(e.target.value) || 0 })} className="bg-white/5 font-mono font-bold" /></div>
              <div className="space-y-2"><Label className="text-[9px] uppercase">Wind (km/h)</Label><Input type="number" value={weather.windSpeed || 0} onChange={(e) => setWeather({ ...weather, windSpeed: parseInt(e.target.value) || 0 })} className="bg-white/5 font-mono font-bold" /></div>
              <div className="space-y-2"><Label className="text-[9px] uppercase">Temp (°C)</Label><Input type="number" value={weather.temperature || 0} onChange={(e) => setWeather({ ...weather, temperature: parseInt(e.target.value) || 0 })} className="bg-white/5 font-mono font-bold" /></div>
            </CardContent>
          </Card>

          <Card className="glass-card border-t-4 border-t-emerald-500">
            <CardHeader className="pb-4 bg-white/5 flex flex-row items-center justify-between"><CardTitle className="text-xs font-black uppercase text-emerald-500 flex items-center gap-2"><Tent className="h-4 w-4" /> Relief Camps</CardTitle><Button variant="outline" size="icon" onClick={addCamp} className="h-7 w-7 glass border-emerald-500/30 text-emerald-500"><Plus className="h-3 w-3" /></Button></CardHeader>
            <CardContent className="pt-6 space-y-4">
              {camps.map((camp, i) => (
                <div key={i} className="flex gap-3 items-end group">
                  <div className="flex-1 space-y-1"><Label className="text-[8px] uppercase opacity-40">Camp Name</Label><Input value={camp.name} onChange={(e) => { const nc = [...camps]; nc[i].name = e.target.value; setCamps(nc); }} className="bg-white/5 h-8 text-[11px] font-bold" /></div>
                  <div className="w-20 space-y-1"><Label className="text-[8px] uppercase opacity-40">Cap %</Label><Input type="number" value={camp.capacityPercent || 0} onChange={(e) => { const nc = [...camps]; nc[i].capacityPercent = parseInt(e.target.value) || 0; setCamps(nc); }} className="bg-white/5 h-8 text-[11px] font-mono" /></div>
                  <Button variant="ghost" size="icon" onClick={() => removeCamp(i)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
