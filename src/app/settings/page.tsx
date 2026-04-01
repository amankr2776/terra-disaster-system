"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Eye, Zap, CloudRain, MapPin, Save, RotateCcw, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [simulationSpeed, setSimulationSpeed] = useState([1])
  const [rainfallThreshold, setRainfallThreshold] = useState([15])
  const [selectedCity, setSelectedCity] = useState("mumbai")

  const handleSave = () => {
    toast({
      title: "Tactical Grid Synchronized",
      description: "Global parameters updated across the subcontinent neural link.",
    })
  }

  const handleReset = () => {
    setSimulationSpeed([1])
    setRainfallThreshold([15])
    setSelectedCity("mumbai")
    toast({
      variant: "outline",
      title: "Settings Reverted",
      description: "Standard operating procedures restored.",
    })
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
          <Button variant="outline" className="glass border-white/10 h-11 px-6 font-bold uppercase tracking-wider text-[10px]" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-8 font-black uppercase tracking-widest text-[10px]" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Sync Grid
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
                onValueChange={setSimulationSpeed} 
                max={5} 
                step={0.5} 
                min={0.5}
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
                onValueChange={setRainfallThreshold} 
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
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-sm font-bold">
                  <SelectValue placeholder="Select Command Sector" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="chennai" className="font-bold">Chennai Sector (S-1)</SelectItem>
                  <SelectItem value="mumbai" className="font-bold">Mumbai Sector (S-2)</SelectItem>
                  <SelectItem value="bangalore" className="font-bold">Bangalore Sector (S-3)</SelectItem>
                </SelectContent>
              </Select>
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
                <p className="text-[10px] text-muted-foreground font-medium">Automatic SMS/Neural-link alerts for citizens in high-risk zones.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="space-y-1">
                <Label className="text-sm font-black uppercase tracking-wider text-white">Satellite Overlay Fidelity</Label>
                <p className="text-[10px] text-muted-foreground font-medium italic">High-resolution vector rendering for topography and flood spread.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
        <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-white" onClick={handleReset}>Discard Local Cache</Button>
        <Button className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 h-12 px-10 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Synchronize Subcontinent Grid
        </Button>
      </div>
    </div>
  )
}
