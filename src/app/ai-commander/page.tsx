"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShieldAlert, 
  Terminal, 
  FileText, 
  Truck, 
  Cpu, 
  Zap, 
  Activity, 
  Send,
  Loader2,
  Navigation,
  Droplets,
  Utensils,
  PlusCircle,
  Clock,
  RefreshCw,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { database, ref, onValue, push, serverTimestamp } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function AICommanderPage() {
  const { toast } = useToast()
  const [analysis, setAnalysis] = useState<any>(null)
  const [tacticalFeed, setTacticalFeed] = useState<any[]>([])
  const [activeReport, setActiveReport] = useState<'report' | 'evacuation' | 'allocation'>('report')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = "TERRA | AI Decision Support";

    // 1. Listen for AI Analysis
    const analysisRef = ref(database, 'terra/aiAnalysis')
    const unsubscribeAnalysis = onValue(analysisRef, (snapshot) => {
      setAnalysis(snapshot.val())
    })

    // 2. Listen for Tactical Feed
    const feedRef = ref(database, 'terra/tacticalFeed')
    const unsubscribeFeed = onValue(feedRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedArray = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        feedArray.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setTacticalFeed(feedArray)
      }
    })

    return () => {
      unsubscribeAnalysis()
      unsubscribeFeed()
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [tacticalFeed, isAnalyzing])

  const runReanalysis = async () => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/ai-analyze', { method: 'POST' })
      if (!res.ok) throw new Error('Analysis failed')
      toast({
        title: "Intelligence Synchronized",
        description: "Tactical models updated. Feed synced.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Link Failure",
        description: "Could not establish connection to neural cluster.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    
    const feedRef = ref(database, 'terra/tacticalFeed')
    push(feedRef, {
      message: chatInput,
      source: "user",
      priority: "INFO",
      timestamp: new Date().toISOString()
    })
    setChatInput("")
  }

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Never"
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (diff < 1) return "Just now"
    return `${diff}m ago`
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
            <h1 className="text-3xl font-bold tracking-tight uppercase italic">AI Decision Support</h1>
            <p className="text-muted-foreground text-sm font-medium">Neural Resource Projection • Last synced: {getTimeAgo(analysis?.lastUpdated)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={runReanalysis} 
            disabled={isAnalyzing}
            className="bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 h-11 px-8 font-black uppercase tracking-widest text-[10px]"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {isAnalyzing ? "ANALYZING..." : "RE-ANALYZE"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Command Controls */}
        <div className="md:col-span-3 space-y-6">
          <Card className="glass-card border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Intelligence Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setActiveReport('report')}
                className={cn(
                  "w-full justify-start gap-3 h-14 glass transition-all",
                  activeReport === 'report' ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(69,175,219,0.2)]" : "hover:bg-white/10"
                )}
                variant="outline"
              >
                <FileText className={cn("h-5 w-5", activeReport === 'report' ? "text-primary" : "text-muted-foreground")} />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase">Situation Report</div>
                  <div className="text-[10px] text-muted-foreground uppercase opacity-60 font-black">Neural Summary</div>
                </div>
              </Button>
              <Button 
                onClick={() => setActiveReport('evacuation')}
                className={cn(
                  "w-full justify-start gap-3 h-14 glass transition-all",
                  activeReport === 'evacuation' ? "bg-destructive/20 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "hover:bg-white/10"
                )}
                variant="outline"
              >
                <Navigation className={cn("h-5 w-5", activeReport === 'evacuation' ? "text-destructive" : "text-muted-foreground")} />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase">Evacuation Plan</div>
                  <div className="text-[10px] text-muted-foreground uppercase opacity-60 font-black">Route Matrix</div>
                </div>
              </Button>
              <Button 
                onClick={() => setActiveReport('allocation')}
                className={cn(
                  "w-full justify-start gap-3 h-14 glass transition-all",
                  activeReport === 'allocation' ? "bg-accent/20 border-accent shadow-[0_0_15px_rgba(125,102,237,0.2)]" : "hover:bg-white/10"
                )}
                variant="outline"
              >
                <Truck className={cn("h-5 w-5", activeReport === 'allocation' ? "text-accent" : "text-muted-foreground")} />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase">Resource Logic</div>
                  <div className="text-[10px] text-muted-foreground uppercase opacity-60 font-black">Logistical Load</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Predictive Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-64">
                {analysis?.timelinePrediction ? (
                  <div className="space-y-6">
                    {analysis.timelinePrediction.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start relative pb-6 border-l border-white/10 ml-1 pl-4">
                        <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                        <div>
                          <div className="text-[10px] font-mono font-black text-accent">{item.time}</div>
                          <div className="text-[11px] font-bold leading-tight text-white mb-1 uppercase italic">{item.event}</div>
                          <Badge variant="outline" className="text-[8px] h-4 px-1 bg-white/5 border-white/10 text-muted-foreground">{item.riskLevel}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground italic text-center py-8">
                    Awaiting neural temporal projection...
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Command Log & Detailed View */}
        <div className="md:col-span-6 flex flex-col min-h-0 gap-6">
          {/* Detailed Intelligence View */}
          <Card className="glass-card border-t-4 border-t-primary shadow-2xl flex-1 flex flex-col">
            <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Tactical Detail: {activeReport.toUpperCase()}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">{analysis?.confidence || 0}% Model confidence</Badge>
            </CardHeader>
            <div className="flex-1 p-6 overflow-auto">
              {analysis ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-medium bg-white/5 p-6 rounded-xl border border-white/5 italic">
                    {activeReport === 'report' ? analysis.situationReport :
                     activeReport === 'evacuation' ? analysis.evacuationPlan :
                     analysis.resourceAllocation}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                  <Activity className="h-12 w-12 mb-4 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-widest">Awaiting authority data input for neural analysis...</p>
                </div>
              )}
            </div>
          </Card>

          {/* Neural Command Stream */}
          <Card className="glass-card h-[40%] flex flex-col overflow-hidden border-t-4 border-t-accent">
            <CardHeader className="border-b border-white/5 bg-white/5 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Terminal className="h-3 w-3 text-accent" />
                Neural Command Stream
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-3">
                {tacticalFeed.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.source === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] font-mono text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-tighter",
                        msg.source === 'ai' ? 'text-accent' : msg.source === 'user' ? 'text-white' : 'text-primary'
                      )}>
                        [{msg.source}]
                      </span>
                    </div>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-xl text-[11px] leading-tight shadow-lg",
                      msg.source === 'user' 
                        ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' 
                        : msg.source === 'ai'
                        ? 'bg-accent/10 border border-accent/20 text-accent rounded-tl-none italic'
                        : 'bg-white/5 border border-white/5 text-muted-foreground rounded-tl-none'
                    )}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                {isAnalyzing && (
                  <div className="flex flex-col items-start">
                    <div className="bg-accent/5 border border-accent/10 p-3 rounded-xl rounded-tl-none flex items-center gap-3">
                      <Loader2 className="h-3 w-3 animate-spin text-accent" />
                      <span className="text-[10px] text-muted-foreground italic font-mono tracking-widest">Accessing tactical clusters...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-white/5 bg-black/20">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder="Neural Link Input..." 
                  className="bg-white/5 border-white/10 h-8 font-mono text-[10px] focus:ring-accent"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <Button type="submit" size="icon" className="h-8 w-8 bg-accent hover:bg-accent/90 shrink-0">
                  <Send className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Right Column: Impact Vector Analysis */}
        <div className="md:col-span-3 space-y-6 overflow-y-auto pr-1">
          <Card className="glass-card border-t-2 border-t-white/10 shadow-xl">
            <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" />
                Impact Vector Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                <div className="text-4xl font-black text-white tracking-tighter">
                  {analysis?.impactAnalysis?.affectedPopulation?.toLocaleString() || "---"}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-60">At-Risk Citizens</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Water req.</span>
                  </div>
                  <span className="font-mono font-black text-xs text-primary">
                    {analysis?.impactAnalysis ? `${analysis.impactAnalysis.waterRequired.toLocaleString()} L` : "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Utensils className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Food req.</span>
                  </div>
                  <span className="font-mono font-black text-xs text-amber-500">
                    {analysis?.impactAnalysis ? `${analysis.impactAnalysis.foodRequired.toLocaleString()} KG` : "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <PlusCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Medical</span>
                  </div>
                  <span className="font-mono font-black text-xs text-emerald-500">
                    {analysis?.impactAnalysis ? `${analysis.impactAnalysis.medicalResources.toLocaleString()} u` : "---"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-accent/5">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <ShieldAlert className="h-3 w-3" />
                Neural Integrity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="uppercase font-bold">Fidelity</span>
                  <span className="text-accent font-black">{analysis?.confidence || 0}%</span>
                </div>
                <Progress value={analysis?.confidence || 0} className="h-1 bg-white/5" />
              </div>
              <p className="text-[9px] leading-relaxed text-muted-foreground italic font-medium">
                AI cluster is processing high-bandwidth telemetry from global tactical sensor nodes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
