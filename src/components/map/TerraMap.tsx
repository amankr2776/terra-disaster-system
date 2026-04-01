"use client"

import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Maximize2, Box } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TerraMapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    id: string
    coordinates: [number, number]
    type: 'incident' | 'resource' | 'shelter'
    severity?: 'low' | 'medium' | 'high'
    label: string
  }>
  disasterOverlay?: any // GeoJSON for spread animation
  enable3D?: boolean
}

const STATIC_FLOOD_ZONES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Adyar', severity: 'high', risk: '92%', color: '#ef4444' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.245, 13.000], [80.270, 13.000], [80.270, 13.015], [80.245, 13.015], [80.245, 13.000]]]
      }
    }
  ]
}

export function TerraMap({ center = [72.8777, 19.0760], zoom = 11, markers = [], disasterOverlay, enable3D = true }: TerraMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const markersRef = useRef<maplibregl.Marker[]>([])

  // 1. Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: center,
      zoom: zoom,
      pitch: enable3D ? 45 : 0,
      bearing: enable3D ? -17.6 : 0,
      attributionControl: false
    })

    map.current = mapInstance

    mapInstance.on('load', () => {
      if (!mapInstance || !mapInstance.getCanvas()) return

      try {
        if (enable3D) {
          mapInstance.addLayer({
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 14,
            'paint': {
              'fill-extrusion-color': '#334155',
              'fill-extrusion-height': ['get', 'render_height'],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.6
            }
          });
        }

        mapInstance.addSource('flood-zones', {
          type: 'geojson',
          data: STATIC_FLOOD_ZONES as any
        })

        mapInstance.addLayer({
          id: 'flood-zones-fill',
          type: 'fill',
          source: 'flood-zones',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.15
          }
        })

        mapInstance.addSource('simulation-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })

        mapInstance.addLayer({
          id: 'simulation-layer-fill',
          type: 'fill',
          source: 'simulation-source',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.4
          }
        })

        mapInstance.addLayer({
          id: 'simulation-layer-outline',
          type: 'line',
          source: 'simulation-source',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 3,
            'line-dasharray': [2, 1]
          }
        })

        setIsLoaded(true)
      } catch (err) {
        console.warn("Map layer initialization failed", err)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
      setIsLoaded(false)
    }
  }, [])

  // 2. Handle center and zoom changes
  useEffect(() => {
    if (!map.current || !isLoaded) return
    try {
      map.current.easeTo({ center, zoom, duration: 1000 })
    } catch (e) {
      console.warn("Failed to ease map", e)
    }
  }, [center, zoom, isLoaded])

  // 3. Handle dynamic overlay changes
  useEffect(() => {
    if (!map.current || !isLoaded) return
    
    const updateOverlay = () => {
      if (!map.current || !map.current.getCanvas()) return
      try {
        const source = map.current.getSource('simulation-source') as maplibregl.GeoJSONSource
        if (source) {
          source.setData(disasterOverlay || { type: 'FeatureCollection', features: [] })
        }
      } catch (e) {
        console.warn("Failed to update simulation overlay", e)
      }
    }

    if (map.current.isStyleLoaded()) {
      updateOverlay()
    } else {
      map.current.once('idle', updateOverlay)
    }
  }, [disasterOverlay, isLoaded])

  // 4. Handle markers updates
  useEffect(() => {
    if (!map.current || !isLoaded) return

    const currentMap = map.current

    // Clear existing markers immediately
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const addMarkers = () => {
      if (!currentMap || !currentMap.getCanvas() || !currentMap.isStyleLoaded()) return

      markers.forEach(markerData => {
        const el = document.createElement('div')
        el.className = 'custom-marker'
        const color = markerData.type === 'incident' ? (markerData.severity === 'high' ? '#ef4444' : '#f59e0b') : '#45AFDB'
        
        el.style.backgroundColor = color
        el.style.width = '14px'
        el.style.height = '14px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid white'
        el.style.boxShadow = `0 0 15px ${color}`
        
        try {
          // Re-verify map validity before adding to prevent 'projection' error
          if (currentMap && currentMap.getCanvas()) {
            const marker = new maplibregl.Marker(el)
              .setLngLat(markerData.coordinates)
              .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(
                `<div class="p-2 bg-background text-foreground rounded border border-white/10 shadow-xl">
                  <p class="text-[10px] font-black uppercase tracking-widest">${markerData.label}</p>
                </div>`
              ))
              .addTo(currentMap)
            
            markersRef.current.push(marker)
          }
        } catch (e) {
          console.warn("Marker creation error suppressed:", e)
        }
      })
    }

    if (currentMap.isStyleLoaded()) {
      addMarkers()
    } else {
      currentMap.once('idle', addMarkers)
    }

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [markers, isLoaded])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden group border border-white/10">
      <div ref={mapContainer} className="w-full h-full" />
      
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <Button size="icon" variant="secondary" className="glass w-9 h-9 rounded-lg shadow-xl border-white/10">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="glass w-9 h-9 rounded-lg shadow-xl border-white/10">
          <Box className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest border-white/10 z-20 shadow-2xl">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
        Neural Surveillance Linked
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md z-30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold tracking-widest font-mono text-primary animate-pulse">INITIATING TACTICAL GRID...</span>
          </div>
        </div>
      )}
    </div>
  )
}
