
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Eye, Zap, CloudRain, MapPin, Save, RotateCcw, Activity, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { database, ref, onValue, set, push, serverTimestamp } from "@/lib/firebase"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  // Settings State
  const [simulationSpeed, setSimulationSpeed] = useState([1])
  const [rainfallThreshold, setRainfallThreshold] = useState([15])
  const [primarySector, setPrimarySector] = useState("Mumbai Sector (S-2)")
  const [criticalBroadcaster, setCriticalBroadcaster] = useState(true)
  const [satelliteFidelity, setSatelliteFidelity] = useState(true)

  // 1. Listen for current settings
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

  // 2. Save settings to Firebase
  const saveSetting = (key: string, value: any) => {
    const settingRef = ref(database, `terra/settings/${key}`)
    set(settingRef, value)
  }

  const handleSyncGrid = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/seed')
      if (!res.ok) throw new Error('Sync failed')
      toast({
        title: "Grid Synchronized",
        description: "Subcontinent tactical data re-aligned with central command.",
      })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Neural link lost during global synchronization.",
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleResetDefaults = async () => {
    setLoading(true)
    try {
      const defaults = {
        simulationSpeed: 1,
        rainfallThreshold: 15,
        primarySector: "Mumbai Sector (S-2)",
        criticalBroadcaster: true,
        satelliteFidelity: true
      }
      await set(ref(database, 'terra/settings'), defaults)
      toast({
        title: "Standard Procedures Restored",
        description: "All tactical parameters reset to system defaults.",
      })
    } catch (e) {
      toast({ variant: "destructive", title: "Reset Failed" })
    } finally {
      setLoading(false)
    }
  }

  const handleDiscardCache = () => {
    localStorage.clear()
    sessionStorage.clear()
    toast({
      title: "Local Cache Purged",
      description: "Terminal-specific data has been cleared from local storage.",
    })
  }

  const handleNotificationRequest = (enabled: boolean) => {
    if (enabled && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setCriticalBroadcaster(true)
          saveSetting('criticalBroadcaster', true)
          toast({ title: "Broadcaster Enabled", description: "Critical alerts will now trigger system notifications." })
        } else {
          setCriticalBroadcaster(false)
          saveSetting('criticalBroadcaster', false)
          toast({ variant: "destructive", title: "Permission Denied", description: "System notifications blocked by browser." })
        }
      })
    } else {
      setCriticalBroadcaster(false)
      saveSetting('criticalBroadcaster', false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(69,175,219,0.2)]">
            <Settings className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">System Configuration</h1>
            <p className="text-muted-foreground text-sm font-medium">Global Neural Parameters & Interface Fidelity</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass border-white/10 h-11 px-6 font-bold uppercase tracking-wider text-[10px]" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-8 font-black uppercase tracking-widest text-[10px]" 
            onClick={handleSyncGrid}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Grid
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Simulation Engine Controls */}
        <Card className="glass-card border-t-4 border-t-accent shadow-2xl">
          <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent">
              <Zap className="h-4 w-4" />
              Neural Simulation Engine
            </CardTitle>
            <CardDescription className="text-[10px] font-mono text-muted-foreground">Adjust real-time compute and predictive velocity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 pt-8">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-wider text-white">Simulation Speed</Label>
                  <p className="text-xs text-muted-foreground font-medium italic">Multiplier for temporal projection velocity during simulations.</p>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold text-accent uppercase mb-1">Current Scale</div>
                   <div className="text-2xl font-mono font-black text-white leading-none">{simulationSpeed[0]}x</div>
                </div>
              </div>
              <Slider 
                value={simulationSpeed} 
                onValueChange={(v) => { setSimulationSpeed(v); saveSetting('simulationSpeed', v[0]); }} 
                max={10} 
                step={0.5} 
                min={1}
                className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-accent"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-wider text-white">Rainfall Alert Threshold</Label>
                  <p className="text-xs text-muted-foreground font-medium italic">Precipitation intensity (mm/h) required to trigger automatic system escalation.</p>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold text-primary uppercase mb-1">Alert Vector</div>
                   <div className="text-2xl font-mono font-black text-white leading-none">{rainfallThreshold[0]} <span className="text-xs font-medium opacity-50">mm/h</span></div>
                </div>
              </div>
              <Slider 
                value={rainfallThreshold} 
                onValueChange={(v) => { setRainfallThreshold(v); saveSetting('rainfallThreshold', v[0]); }} 
                max={100} 
                step={1} 
                min={5}
                className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Configuration */}
        <Card className="glass-card border-t-4 border-t-primary shadow-2xl">
          <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <MapPin className="h-4 w-4" />
              Command Sector Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-wider text-white">Primary Tactical Sector</Label>
              <div className="flex gap-4">
                <Input 
                  value={primarySector} 
                  onChange={(e) => setPrimarySector(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 font-bold"
                />
                <Button onClick={() => saveSetting('primarySector', primarySector)} className="h-12 bg-primary px-8 font-black uppercase tracking-widest text-[10px]">
                  SET SECTOR
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">Updates coordinates and telemetry focus for the entire command grid.</p>
            </div>
          </CardContent>
        </Card>

        {/* Global Notifications */}
        <Card className="glass-card border-t-4 border-t-white/5 shadow-2xl">
          <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Bell className="h-4 w-4" />
              Alert Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-8">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="space-y-1">
                <Label className="text-sm font-black uppercase tracking-wider text-white">Critical Broadcaster</Label>
                <p className="text-[10px] text-muted-foreground font-medium">Automatic Browser notifications for citizens in high-risk zones.</p>
              </div>
              <Switch 
                checked={criticalBroadcaster} 
                onCheckedChange={handleNotificationRequest}
                className="data-[state=checked]:bg-primary" 
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="space-y-1">
                <Label className="text-sm font-black uppercase tracking-wider text-white">Satellite Overlay Fidelity</Label>
                <p className="text-[10px] text-muted-foreground font-medium italic">High-resolution vector rendering for topography and flood spread.</p>
              </div>
              <Switch 
                checked={satelliteFidelity} 
                onCheckedChange={(v) => { setSatelliteFidelity(v); saveSetting('satelliteFidelity', v); }}
                className="data-[state=checked]:bg-accent" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
        <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-white" onClick={handleDiscardCache}>Discard Local Cache</Button>
        <Button 
          className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 h-12 px-10 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl" 
          onClick={handleSyncGrid}
          disabled={syncing}
        >
          {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Synchronize Subcontinent Grid
        </Button>
      </div>
    </div>
  )
}
