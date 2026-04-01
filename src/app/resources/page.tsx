"use client"

import { useState, useEffect } from "react"
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
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TerraMap } from "@/components/map/TerraMap"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

const initialResources = [
  { 
    id: "amb",
    name: "Ambulances", 
    available: 42, 
    deployed: 18, 
    capacity: 60, 
    icon: Ambulance, 
    color: "text-primary",
    status: "Active"
  },
  { 
    id: "heli",
    name: "Helicopters", 
    available: 5, 
    deployed: 7, 
    capacity: 12, 
    icon: Plane, 
    color: "text-accent",
    status: "Limited"
  },
  { 
    id: "teams",
    name: "Rescue Teams", 
    available: 24, 
    deployed: 16, 
    capacity: 40, 
    icon: Users, 
    color: "text-emerald-500",
    status: "Optimal"
  },
  { 
    id: "camps",
    name: "Relief Camps", 
    available: 8, 
    deployed: 17, 
    capacity: 25, 
    icon: Tent, 
    color: "text-amber-500",
    status: "Warning"
  },
]

export default function ResourcesPage() {
  const { toast } = useToast()
  const [resources, setResources] = useState(initialResources)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)

  const handleReset = () => {
    setResources(initialResources)
    toast({
      title: "Tactical Grid Reset",
      description: "Inventory counts synchronized with central command.",
    })
  }

  const handleDeploy = () => {
    setIsDeploying(true)
    setTimeout(() => {
      setIsDeploying(false)
      toast({
        title: "Deployment Initiated",
        description: "High-priority assets are now en route to Active Zones.",
      })
    }, 1500)
  }

  const filteredInventory = [
    { name: "MED-ALPHA-01", type: "Ambulance", loc: "Sector 4 Point A", status: "Deployed", load: 100 },
    { name: "AIR-STRIKE-8", type: "Helicopter", loc: "Regional Pad B", status: "Available", load: 0 },
    { name: "RESCUE-UNIT-D", type: "Rescue Team", loc: "Mission Bay", status: "En Route", load: 45 },
    { name: "CAMP-ZULU", type: "Relief Camp", loc: "Civic Center", status: "Full", load: 100 },
    { name: "MED-BRAVO-04", type: "Ambulance", loc: "Coastal Road", status: "Available", load: 0 }
  ].filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resource Management</h1>
            <p className="text-muted-foreground">Strategic Asset Inventory & Deployment Tracker</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-white/10 gap-2 h-11" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Reset Grid
          </Button>
          <Button 
            className="gap-2 bg-primary shadow-lg shadow-primary/20 h-11 px-6 font-bold uppercase tracking-wider" 
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            {isDeploying ? "Deploying..." : "Deploy Asset"}
          </Button>
        </div>
      </div>

      {/* Resource Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((cat) => (
          <Card key={cat.id} className="glass-card hover:bg-white/5 transition-all group overflow-hidden border-t-2 border-t-white/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5`}>
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
                <Badge variant={cat.status === 'Warning' ? 'destructive' : 'outline'} className="text-[9px] uppercase tracking-widest h-5 bg-white/5">
                  {cat.status}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-bold text-white leading-none">{cat.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Live Sector Inventory</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Available</span>
                  <span className="text-sm font-mono font-bold text-emerald-500">{cat.available}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Deployed</span>
                  <span className="text-sm font-mono font-bold text-primary">{cat.deployed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Capacity</span>
                  <span className="text-sm font-mono font-bold">{cat.capacity}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Load Vector</span>
                  <span className={cat.deployed/cat.capacity > 0.8 ? 'text-destructive' : ''}>
                    {Math.round((cat.deployed / cat.capacity) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(cat.deployed / cat.capacity) * 100} 
                  className={`h-1 ${cat.deployed/cat.capacity > 0.8 ? '[&>div]:bg-destructive' : ''}`} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Grid: Searchable List and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Inventory List / Manual Override */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <Card className="glass-card flex-1 overflow-hidden flex flex-col border border-white/5 shadow-2xl">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Active Unit Tracker
              </CardTitle>
            </CardHeader>
            <div className="p-4 border-b border-white/5 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Filter by ID or unit type..." 
                  className="pl-8 bg-white/5 border-white/10 h-10 text-xs font-mono" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30 h-5 px-2">ALL UNITS</Badge>
                <Badge variant="outline" className="text-[9px] text-muted-foreground border-white/10 h-5 px-2">DEPLOYED ONLY</Badge>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-white/5">
                {filteredInventory.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-xs font-black group-hover:text-primary transition-colors tracking-wider">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{item.type}</p>
                      </div>
                      <Badge variant={item.status === 'Full' || item.status === 'Deployed' ? 'secondary' : 'outline'} className="text-[8px] h-4 uppercase font-bold">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.loc}</span>
                      <span className={`font-mono font-bold ${item.load > 80 ? 'text-destructive' : 'text-emerald-500'}`}>
                        {item.load}% UTILIZED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Tactical Resource Map */}
        <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <TerraMap 
            center={[72.8777, 19.0760]}
            zoom={12}
            markers={[
              { id: 'm1', coordinates: [72.8777, 19.0760], type: 'resource', label: 'MED-ALPHA-01' },
              { id: 'm2', coordinates: [72.8250, 19.0500], type: 'resource', label: 'AIR-STRIKE-8' },
              { id: 's1', coordinates: [72.8500, 19.1000], type: 'shelter', label: 'CAMP-ZULU' }
            ]}
          />
          <div className="absolute top-4 left-4 glass p-4 rounded-xl border-white/10 z-10 max-w-xs pointer-events-none">
             <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">Grid Stability: Optimal</span>
             </div>
             <p className="text-[10px] leading-relaxed text-muted-foreground font-medium">
                All high-priority assets currently synced with <span className="text-primary font-bold">Neural Link X-44</span>. No communication blackouts detected.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
