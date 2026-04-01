"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShieldAlert, 
  Terminal, 
  FileText, 
  Truck, 
  Users, 
  CloudRain, 
  Send,
  Cpu,
  Zap,
  Activity,
  Wind,
  Thermometer,
  Loader2,
  Droplets,
  Utensils,
  PlusCircle,
  Navigation,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getCommanderIntelligence, type CommanderIntelligenceOutput } from "@/ai/flows/commander-intelligence"

export default function AICommanderPage() {
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Neural Link established. Sector 4 telemetry synced.', time: '08:42:11' },
    { role: 'ai', text: 'Strategic AI Brain initialized. Monitoring subcontinent risk vectors.', time: '08:43:05' },
  ])
  const [input, setInput] = useState("")
  const [weather, setWeather] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<CommanderIntelligenceOutput | null>(null);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data.telemetry));
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const newMsg = { role: 'user', text: input, time }
    setMessages(prev => [...prev, newMsg])
    setInput("")

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Query received. Correlating with tactical data streams...', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      }])
    }, 600)
  }

  const triggerAIAction = async (type: 'report' | 'allocation' | 'evacuation') => {
    setLoadingType(type);
    
    const weatherContext = weather ? `${weather.rainfall}, ${weather.windSpeed}, ${weather.temperature}` : 'Unknown';
    const zoneContext = "SOMA (Critical), Mission Bay (Warning), Dogpatch (Critical)";
    const popContext = "142,500 At-Risk, 72% Shelter Capacity";

    try {
      const result = await getCommanderIntelligence({
        type,
        weatherTelemetry: weatherContext,
        activeZones: zoneContext,
        populationContext: popContext,
      });

      setLastAnalysis(result);
      setMessages(prev => [...prev, {
        role: 'system',
        text: `EXECUTING: ${result.title.toUpperCase()}`,
        time: result.timestamp
      }, {
        role: 'ai',
        text: result.content,
        time: result.timestamp
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'system',
        text: 'ERROR: Neural link interruption during tactical generation.',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Decision Support</h1>
            <p className="text-muted-foreground">Unified Strategic Command & Resource Projection</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-9 px-4 glass border-accent/30 text-accent gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI Brain Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Command Controls */}
        <div className="md:col-span-3 space-y-6">
          <Card className="glass-card border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Intelligence Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => triggerAIAction('report')}
                disabled={!!loadingType}
                className="w-full justify-start gap-3 h-12 glass hover:bg-white/10" 
                variant="outline"
              >
                {loadingType === 'report' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                <div className="text-left">
                  <div className="text-xs font-bold">Situation Report</div>
                  <div className="text-[10px] text-muted-foreground">Full Intelligence Summary</div>
                </div>
              </Button>
              <Button 
                onClick={() => triggerAIAction('evacuation')}
                disabled={!!loadingType}
                className="w-full justify-start gap-3 h-12 glass hover:bg-white/10" 
                variant="outline"
              >
                {loadingType === 'evacuation' ? <Loader2 className="h-5 w-5 animate-spin text-destructive" /> : <Navigation className="h-5 w-5 text-destructive" />}
                <div className="text-left">
                  <div className="text-xs font-bold">Evacuation Plan</div>
                  <div className="text-[10px] text-muted-foreground">Routes & Safety Protocols</div>
                </div>
              </Button>
              <Button 
                onClick={() => triggerAIAction('allocation')}
                disabled={!!loadingType}
                className="w-full justify-start gap-3 h-12 glass hover:bg-white/10" 
                variant="outline"
              >
                {loadingType === 'allocation' ? <Loader2 className="h-5 w-5 animate-spin text-accent" /> : <Truck className="h-5 w-5 text-accent" />}
                <div className="text-left">
                  <div className="text-xs font-bold">Resource Allocation</div>
                  <div className="text-[10px] text-muted-foreground">Asset Deployment Strategy</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timeline Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastAnalysis?.timelinePrediction ? (
                <div className="space-y-4">
                  {lastAnalysis.timelinePrediction.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" />
                      <div>
                        <div className="text-[10px] font-mono font-bold text-accent">{item.time}</div>
                        <div className="text-[11px] font-medium leading-tight">{item.event}</div>
                        <Badge className="mt-1 text-[8px] h-3.5 px-1 bg-white/5 border-white/10 text-muted-foreground">{item.riskLevel}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground italic text-center py-4">
                  Run Intelligence Action to generate predictive timeline.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Command Log */}
        <div className="md:col-span-6 flex flex-col min-h-0">
          <Card className="glass-card flex-1 flex flex-col overflow-hidden border-t-4 border-t-accent shadow-2xl">
            <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent" />
                Neural Command Log
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-accent/10 border-accent/20 text-accent">Real-time Stream</Badge>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-muted-foreground">{msg.time}</span>
                      <span className={`text-[9px] font-bold uppercase ${msg.role === 'ai' ? 'text-accent' : msg.role === 'system' ? 'text-primary' : 'text-white'}`}>
                        {msg.role}
                      </span>
                    </div>
                    <div className={`max-w-[90%] p-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' 
                        : msg.role === 'system'
                        ? 'bg-white/5 border border-white/5 font-mono text-[11px] text-primary'
                        : 'bg-accent/10 border border-accent/20 text-accent-foreground rounded-tl-none whitespace-pre-wrap'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/5 bg-black/20">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder="Request tactical data or issue override..." 
                  className="bg-white/5 border-white/10 h-10 font-mono text-xs"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Right Column: Impact Analysis */}
        <div className="md:col-span-3 space-y-6 overflow-y-auto pr-1">
          <Card className="glass-card border-t-2 border-t-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" />
                Population Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-3xl font-black text-white">
                  {lastAnalysis?.impactAnalysis?.affectedPopulation.toLocaleString() || "---"}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">At-Risk Citizens</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-3.5 w-3.5 text-primary" />
                    <span>Water Required</span>
                  </div>
                  <span className="font-mono font-bold text-primary">
                    {lastAnalysis?.impactAnalysis ? `${lastAnalysis.impactAnalysis.waterRequired.toLocaleString()} L` : "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-3.5 w-3.5 text-amber-500" />
                    <span>Food Required</span>
                  </div>
                  <span className="font-mono font-bold text-amber-500">
                    {lastAnalysis?.impactAnalysis ? `${lastAnalysis.impactAnalysis.foodRequired.toLocaleString()} KG` : "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Medical Kits</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-500">
                    {lastAnalysis?.impactAnalysis ? `${lastAnalysis.impactAnalysis.medicalResources.toLocaleString()} units` : "---"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Navigation className="h-3 w-3 text-destructive" />
                Evacuation Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lastAnalysis?.evacuationRoutes ? (
                lastAnalysis.evacuationRoutes.map((route, i) => (
                  <div key={i} className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <Navigation className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{route}</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-muted-foreground italic text-center py-2">No active routes defined.</div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3 text-accent" />
                Live Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>AI Confidence</span>
                  <span className="text-accent">96.4%</span>
                </div>
                <Progress value={96.4} className="h-1" />
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                AI Brain is processing telemetry from {weather?.rainfall ? "active satellite feed" : "historical models"}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
