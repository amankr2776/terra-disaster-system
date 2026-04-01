
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Zap, Globe, Activity, Layers, Radio, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { database, ref, onValue, limitToLast, query } from "@/lib/firebase"
import dynamic from "next/dynamic"

const ThreeGlobe = dynamic(() => import("@/components/landing/ThreeGlobe"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
})

export default function LandingPage() {
  const [activeDisaster, setActiveDisaster] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [tickerMessages, setTickerMessages] = useState<any[]>([])

  useEffect(() => {
    // 1. Listen for data for stats
    const disasterRef = ref(database, 'terra/activeDisaster')
    const analysisRef = ref(database, 'terra/aiAnalysis')
    const feedRef = query(ref(database, 'terra/tacticalFeed'), limitToLast(10))

    const unsubDisaster = onValue(disasterRef, (snap) => setActiveDisaster(snap.val()))
    const unsubAnalysis = onValue(analysisRef, (snap) => setAnalysis(snap.val()))
    const unsubFeed = onValue(feedRef, (snap) => {
      const data = snap.val()
      if (data) {
        setTickerMessages(Object.values(data).sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ))
      }
    })

    return () => {
      unsubDisaster()
      unsubAnalysis()
      unsubFeed()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-rajdhani">
      {/* 1. Three.js Background */}
      <ThreeGlobe />

      {/* 2. Foreground UI Overlay */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        {/* Top Bar */}
        <header className="flex items-center justify-between p-8 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(69,175,219,0.5)]">
              <Layers className="text-white h-6 w-6" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white italic">TERRA</span>
          </div>
          <Link href="/authority-input">
            <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold tracking-widest uppercase text-xs gap-2 h-11 px-6">
              <Lock className="h-4 w-4" />
              Authority Login
            </Button>
          </Link>
        </header>

        {/* Hero Center */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
          <div className="space-y-2 animate-in fade-in zoom-in duration-1000">
            <h1 className="text-[120px] font-black leading-none tracking-tighter italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              TERRA
            </h1>
            <p className="text-xl font-medium tracking-[0.4em] uppercase text-primary/80">
              Disaster Intelligence • Real-Time • AI-Powered
            </p>
            <div className="flex justify-center pt-4">
              <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 gap-2 py-1 px-4 text-[10px] font-black tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                Live System Active
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pointer-events-auto">
            <div className="glass p-6 rounded-2xl border-white/10 backdrop-blur-2xl flex flex-col items-center gap-2">
              <Activity className="h-5 w-5 text-destructive" />
              <div className="text-3xl font-black text-white">6 Active Zones</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Strategic Risk Vectors</div>
            </div>
            <div className="glass p-6 rounded-2xl border-white/10 backdrop-blur-2xl flex flex-col items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div className="text-3xl font-black text-white">
                {activeDisaster?.affectedPopulation ? `${(activeDisaster.affectedPopulation / 1000000).toFixed(1)}M` : "2.4M"} Under Watch
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Population Exposure</div>
            </div>
            <div className="glass p-6 rounded-2xl border-white/10 backdrop-blur-2xl flex flex-col items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <div className="text-3xl font-black text-white">
                {analysis?.confidence ? `${analysis.confidence}%` : "96.4%"}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">AI Neural Confidence</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 pointer-events-auto">
            <Link href="/dashboard">
              <Button className="h-16 px-12 text-lg font-black uppercase tracking-widest bg-gradient-to-r from-destructive to-orange-600 hover:scale-105 transition-transform shadow-2xl shadow-destructive/20 border-b-4 border-black/20">
                Enter Command Center
              </Button>
            </Link>
            <Link href="/citizen">
              <Button variant="outline" className="h-16 px-12 text-lg font-black uppercase tracking-widest border-2 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white">
                Citizen Safety Portal
              </Button>
            </Link>
          </div>
        </main>

        {/* Bottom Ticker */}
        <footer className="h-14 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center overflow-hidden pointer-events-auto">
          <div className="flex whitespace-nowrap animate-ticker py-2">
            {[...tickerMessages, ...tickerMessages].map((msg, i) => (
              <div key={i} className="flex items-center gap-4 px-8 border-r border-white/5 group hover:bg-white/5 transition-colors cursor-default">
                <span className={msg.priority === 'CRITICAL' ? 'text-destructive' : msg.priority === 'WARNING' ? 'text-amber-500' : 'text-primary'}>●</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                  {msg.priority}: {msg.message} — {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {tickerMessages.length === 0 && (
              <div className="px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">
                ● Establishing neural link to global tactical nodes... satellite sync in progress...
              </div>
            )}
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
