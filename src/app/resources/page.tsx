"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  MapPin, 
  Truck, 
  Shield, 
  Search, 
  Filter, 
  Ambulance, 
  Plane, 
  Users, 
  Tent, 
  RotateCcw, 
  PlusCircle,
  Activity,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  Settings2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TerraMap } from "@/components/map/TerraMap"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { database, ref, onValue, set, push, serverTimestamp } from "@/lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "Ambulance", icon: Ambulance, color: "text-primary", label: "Ambulances" },
  { id: "Helicopter", icon: Plane, color: "text-accent", label: "Helicopters" },
  { id: "Rescue Team", icon: Users, color: "text-emerald-500", label: "Rescue Teams" },
  { id: "Relief Camp", icon: Tent, color: "text-amber-500", label: "Relief Camps" },
]

const DEFAULT_UNITS = [
  { name: "MED-ALPHA-01", type: "Ambulance", loc: "Sector 4 Point A", status: "Deployed", load: 100 },
  { name: "AIR-STRIKE-8", type: "Helicopter", loc: "Regional Pad B", status: "Available", load: 0 },
  { name: "RESCUE-UNIT-D", type: "Rescue Team", loc: "Mission Bay", status: "En Route", load: 45 },
  { name: "CAMP-ZULU", type: "Relief Camp", loc: "Civic Center", status: "Full", load: 100 },
  { name: "MED-BRAVO-04", type: "Ambulance", loc: "Coastal Road", status: "Available", load: 0 }
]

export default function ResourcesPage() {
  const { toast } = useToast()
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | "DEPLOYED">("ALL")
  
  // Modals
  const [isDeployOpen, setIsDeployOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)

  // Form State
  const [newAsset, setNewAsset] = useState({
    type: "Ambulance",
    name: "",
    loc: "",
    load: 0
  })

  useEffect(() => {
    document.title = "TERRA | Resource Management";
    
    const unitsRef = ref(database, 'terra/resources/units')
    const unsubscribe = onValue(unitsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const unitsList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        setUnits(unitsList)
      } else {
        setUnits([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catUnits = units.filter(u => u.type === cat.id)
      const deployed = catUnits.filter(u => u.status === 'Deployed' || u.status === 'En Route' || u.status === 'Full').length
      const available = catUnits.filter(u => u.status === 'Available').length
      const capacity = Math.max(catUnits.length, 10)
      
      let status = "Optimal"
      if (deployed / capacity > 0.8) status = "Critical"
      else if (deployed / capacity > 0.6) status = "Warning"

      return {
        ...cat,
        available,
        deployed,
        capacity,
        status
      }
    })
  }, [units])

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const matchesSearch = unit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           unit.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           unit.loc.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filterType === "ALL" || 
                           (filterType === "DEPLOYED" && (unit.status === "Deployed" || unit.status === "En Route" || unit.status === "Full"))
      
      return matchesSearch && matchesFilter
    }).sort((a, b) => b.load - a.load)
  }, [units, searchQuery, filterType])

  const handleDeploy = async () => {
    if (!newAsset.name || !newAsset.loc) {
      toast({ variant: "destructive", title: "Validation Error", description: "All telemetry fields are required." })
      return
    }

    setIsDeploying(true)
    try {
      const unitsRef = ref(database, 'terra/resources/units')
      await push(unitsRef, {
        ...newAsset,
        status: "En Route",
        timestamp: serverTimestamp()
      })
      
      toast({
        title: "Deployment Initiated",
        description: `${newAsset.name} has been deployed to ${newAsset.loc}.`,
      })
      setIsDeployOpen(false)
      setNewAsset({ type: "Ambulance", name: "", loc: "", load: 0 })
    } catch (e) {
      toast({ variant: "destructive", title: "Deployment Failed", description: "Neural link lost during asset commission." })
    } finally {
      setIsDeploying(false)
    }
  }

  const updateUnitStatus = async (unitId: string, newStatus: string) => {
    try {
      const unitRef = ref(database, `terra/resources/units/${unitId}`)
      const unit = units.find(u => u.id === unitId)
      await set(unitRef, {
        ...unit,
        status: newStatus,
        load: newStatus === 'Full' || newStatus === 'Deployed' ? 100 : newStatus === 'Available' ? 0 : 45
      })
      toast({ title: "Status Updated", description: "Asset telemetry synchronized." })
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" })
    }
  }

  const handleResetGrid = async () => {
    try {
      const unitsRef = ref(database, 'terra/resources/units')
      const resetData: any = {}
      DEFAULT_UNITS.forEach((u, i) => {
        resetData[`unit_${i}`] = u
      })
      await set(unitsRef, resetData)
      toast({ title: "Tactical Grid Reset", description: "Inventory counts synchronized with central command." })
      setIsResetOpen(false)
    } catch (e) {
      toast({ variant: "destructive", title: "Reset Failed" })
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Resource Management</h1>
            <p className="text-muted-foreground text-sm font-medium">Strategic Asset Inventory & Deployment Tracker</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-white/10 gap-2 h-11 px-6 font-bold uppercase tracking-widest text-[10px]" onClick={() => setIsResetOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Reset Grid
          </Button>
          <Button 
            className="gap-2 bg-primary shadow-lg shadow-primary/20 h-11 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl" 
            onClick={() => setIsDeployOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Deploy Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryStats.map((cat) => (
          <Card key={cat.id} className="glass-card hover:bg-white/5 transition-all group overflow-hidden border-t-2 border-t-white/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5`}>
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
                <Badge variant={cat.status === 'Critical' ? 'destructive' : 'outline'} className={cn(
                  "text-[9px] uppercase tracking-widest h-5 bg-white/5",
                  cat.status === 'Warning' && "border-amber-500 text-amber-500",
                  cat.status === 'Optimal' && "border-emerald-500 text-emerald-500"
                )}>
                  {cat.status}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-black text-white leading-none italic uppercase">{cat.label}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Live Sector Inventory</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Available</span>
                  <span className="text-sm font-mono font-black text-emerald-500">{cat.available}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Deployed</span>
                  <span className="text-sm font-mono font-black text-primary">{cat.deployed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Total</span>
                  <span className="text-sm font-mono font-black">{cat.capacity}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Load Vector</span>
                  <span className={cat.deployed/cat.capacity > 0.8 ? 'text-destructive font-black' : 'font-black'}>
                    {Math.round((cat.deployed / cat.capacity) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(cat.deployed / cat.capacity) * 100} 
                  className={`h-1.5 bg-white/5 ${cat.deployed/cat.capacity > 0.8 ? '[&>div]:bg-destructive' : ''}`} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 pb-12">
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <Card className="glass-card flex-1 overflow-hidden flex flex-col border border-white/5 shadow-2xl">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Active Unit Tracker
              </CardTitle>
            </CardHeader>
            <div className="p-4 border-b border-white/5 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Filter by ID or unit type..." 
                  className="pl-8 bg-white/5 border-white/10 h-10 text-[10px] font-mono" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={filterType === "ALL" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setFilterType("ALL")}
                  className="text-[9px] h-6 px-3 font-black uppercase tracking-widest"
                >
                  ALL UNITS
                </Button>
                <Button 
                  variant={filterType === "DEPLOYED" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setFilterType("DEPLOYED")}
                  className="text-[9px] h-6 px-3 font-black uppercase tracking-widest"
                >
                  DEPLOYED ONLY
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Units...</p>
                  </div>
                ) : filteredUnits.length > 0 ? (
                  filteredUnits.map((item, i) => (
                    <div key={item.id} className="p-4 hover:bg-white/5 transition-colors cursor-default group relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xs font-black group-hover:text-primary transition-colors tracking-widest uppercase italic">{item.name}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">{item.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status === 'Full' || item.status === 'Deployed' ? 'secondary' : 'outline'} className={cn(
                            "text-[8px] h-4 uppercase font-black",
                            item.status === 'Available' && "border-emerald-500/30 text-emerald-500",
                            item.status === 'En Route' && "border-primary/30 text-primary"
                          )}>
                            {item.status}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card">
                              <DropdownMenuLabel className="text-[10px] uppercase font-black">Tactical Override</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem onClick={() => updateUnitStatus(item.id, 'Available')} className="text-xs font-bold">Set Available</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUnitStatus(item.id, 'Deployed')} className="text-xs font-bold">Set Deployed</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUnitStatus(item.id, 'En Route')} className="text-xs font-bold">Set En Route</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUnitStatus(item.id, 'Full')} className="text-xs font-bold text-destructive">Set Full</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3 w-3 text-primary" /> {item.loc}
                        </span>
                        <span className={cn(
                          "font-mono font-black",
                          item.load > 80 ? 'text-destructive' : 'text-emerald-500'
                        )}>
                          {item.load}% UTILIZED
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest italic">No active assets in selected filter</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <TerraMap 
            center={[72.8777, 19.0760]}
            zoom={12}
            markers={filteredUnits.map(u => ({
              id: u.id,
              coordinates: [72.8777 + (Math.random() - 0.5) * 0.05, 19.0760 + (Math.random() - 0.5) * 0.05],
              type: u.type === 'Relief Camp' ? 'shelter' : 'resource',
              label: u.name,
              severity: u.load > 80 ? 'high' : 'low'
            }))}
          />
          <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs pointer-events-none">
             <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase italic tracking-widest text-emerald-500">Grid Stability: Optimal</span>
             </div>
             <p className="text-[10px] leading-relaxed text-muted-foreground font-medium italic">
                All high-priority assets currently synced with Neural Link. Real-time telemetry established for {units.length} units.
             </p>
          </div>
        </div>
      </div>

      <Dialog open={isDeployOpen} onOpenChange={setIsDeployOpen}>
        <DialogContent className="glass-card sm:max-w-[450px] border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              Commission Tactical Asset
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Class</Label>
              <Select value={newAsset.type} onValueChange={(v) => setNewAsset({ ...newAsset, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Designation</Label>
                <Input 
                  placeholder="e.g. MED-01" 
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value.toUpperCase() })}
                  className="bg-white/5 border-white/10 h-12 font-bold uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sector Assignment</Label>
                <Input 
                  placeholder="e.g. North Gate" 
                  value={newAsset.loc}
                  onChange={(e) => setNewAsset({ ...newAsset, loc: e.target.value })}
                  className="bg-white/5 border-white/10 h-12 font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeployOpen(false)} className="glass font-bold h-12 px-6">CANCEL</Button>
            <Button onClick={handleDeploy} disabled={isDeploying} className="bg-primary hover:bg-primary/90 font-black uppercase tracking-widest h-12 px-10 rounded-xl gap-2">
              {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              INITIATE DEPLOYMENT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="glass-card sm:max-w-[400px] border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-destructive flex items-center gap-3">
              <RotateCcw className="h-5 w-5" />
              Neural Reset Protocol
            </DialogTitle>
            <DialogDescription className="text-xs font-medium italic pt-2">
              This will purge all custom deployments and revert the resource grid to default baseline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsResetOpen(false)} className="glass font-bold h-11">ABORT</Button>
            <Button onClick={handleResetGrid} className="bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest h-11 px-8 rounded-xl">
              CONFIRM GRID RESET
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
