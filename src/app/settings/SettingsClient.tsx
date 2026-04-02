"use client"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Settings, Bell, Zap, MapPin, RotateCcw, Loader2, RefreshCw, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { database, ref, onValue, set } from "@/lib/firebase"

export function SettingsClient() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  const [simulationSpeed, setSimulationSpeed] = useState([1])
  const [rainfallThreshold, setRainfallThreshold] = useState([15])
  const [primarySector, setPrimarySector] = useState("Mumbai Sector (S-2)")
  const [criticalBroadcaster, setCriticalBroadcaster] = useState(true)
  const [satelliteFidelity, setSatelliteFidelity] = useState(true)

  useEffect(() => {
    const settingsRef = ref(database, 'terra/settings')
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSimulationSpeed([data.simulationSpeed || 1])
        setRainfallThreshold([data.rainfallThreshold || 15])
        setPrimarySector(data.primarySector || "Mumbai Sector (S-2)")
        setCriticalBroadcaster(data.criticalBroadcaster ?? true)
        setSatelliteFidelity(data.satelliteFidelity ?? true)
      }
    })
    return () => unsubscribe()
  }, [])

  const saveSetting = (key: string, value: any) => {
    const settingRef = ref(database, `terra/settings/${key}`)
    set(settingRef, value)
  }

  const handleSyncGrid = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/seed')
      if (!res.ok) throw new Error('Sync failed')
      toast({ title: "Grid Synchronized" })
    } catch (e) { toast({ variant: "destructive", title: "Sync Error" }) }
    finally { setSyncing(false) }
  }

  const handleResetDefaults = async () => {
    setLoading(true)
    try {
      const defaults = { simulationSpeed: 1, rainfallThreshold: 15, primarySector: "Mumbai Sector (S-2)", criticalBroadcaster: true, satelliteFidelity: true }
      await set(ref(database, 'terra/settings'), defaults)
      toast({ title: "Reset Complete" })
    } catch (e) { toast({ variant: "destructive", title: "Reset Failed" }) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(69,175,219,0.2)]"><Settings className="h-7 w-7 text-primary" /></div>
          <div><h1 className="text-3xl font-black uppercase italic">System Configuration</h1><p className="text-muted-foreground text-sm font-medium">Global Neural Parameters & Interface Fidelity</p></div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass h-11 px-6 uppercase font-bold text-[10px]" onClick={handleResetDefaults}><RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults</Button>
          <Button className="bg-primary hover:bg-primary/90 h-11 px-8 uppercase font-black text-[10px]" onClick={handleSyncGrid} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Sync Grid
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card border-t-4 border-t-accent shadow-2xl">
          <CardHeader className="pb-4 bg-white/5"><CardTitle className="text-xs font-black uppercase text-accent flex items-center gap-2"><Zap className="h-4 w-4" /> Neural Engine</CardTitle></CardHeader>
          <CardContent className="space-y-10 pt-8">
            <div className="space-y-6">
              <div className="flex justify-between items-end"><div><Label className="text-sm font-black uppercase text-white">Simulation Speed</Label><p className="text-xs text-muted-foreground italic">Multiplier for temporal projection velocity.</p></div><div className="text-2xl font-mono font-black text-white">{simulationSpeed[0]}x</div></div>
              <Slider value={simulationSpeed} onValueChange={(v) => { setSimulationSpeed(v); saveSetting('simulationSpeed', v[0]); }} max={10} min={1} step={0.5} />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end"><div><Label className="text-sm font-black uppercase text-white">Rainfall Alert Threshold</Label><p className="text-xs text-muted-foreground italic">Precipitation intensity (mm/h) for system escalation.</p></div><div className="text-2xl font-mono font-black text-white">{rainfallThreshold[0]} mm/h</div></div>
              <Slider value={rainfallThreshold} onValueChange={(v) => { setRainfallThreshold(v); saveSetting('rainfallThreshold', v[0]); }} max={100} min={5} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-primary shadow-2xl">
          <CardHeader className="pb-4 bg-white/5"><CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-2"><MapPin className="h-4 w-4" /> Command Sector</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-8"><div className="space-y-3"><Label className="text-sm font-black uppercase text-white">Primary Tactical Sector</Label><div className="flex gap-4"><Input value={primarySector} onChange={(e) => setPrimarySector(e.target.value)} className="bg-white/5 h-12 font-bold" /><Button onClick={() => saveSetting('primarySector', primarySector)} className="h-12 bg-primary px-8 font-black uppercase text-[10px]">SET SECTOR</Button></div></div></CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-white/5 shadow-2xl">
          <CardHeader className="pb-4 bg-white/5"><CardTitle className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2"><Bell className="h-4 w-4" /> Alert Protocols</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-8">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"><div><Label className="text-sm font-black uppercase text-white">Critical Broadcaster</Label><p className="text-[10px] text-muted-foreground">Browser notifications for high-risk zones.</p></div><Switch checked={criticalBroadcaster} onCheckedChange={(v) => { setCriticalBroadcaster(v); saveSetting('criticalBroadcaster', v); }} /></div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"><div><Label className="text-sm font-black uppercase text-white">Satellite Overlay Fidelity</Label><p className="text-[10px] text-muted-foreground italic">High-resolution vector rendering for maps.</p></div><Switch checked={satelliteFidelity} onCheckedChange={(v) => { setSatelliteFidelity(v); saveSetting('satelliteFidelity', v); }} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
