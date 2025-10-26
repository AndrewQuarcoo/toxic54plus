'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface CustomPoint {
  id: string
  lat: number
  lng: number
  name: string
  status?: 'active' | 'inactive' | 'rehabilitated'
  color?: string
}

interface MapboxMapProps {
  selectedRegion: string
  onSiteClick?: (site: any) => void
}

export default function MapboxMap({ selectedRegion, onSiteClick }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [customPoints, setCustomPoints] = useState<CustomPoint[]>([])
  
  // Default points - you can customize these
  const defaultPoints: CustomPoint[] = [
    { id: '1', lat: 5.3, lng: -1.9, name: 'Tarkwa Mining Site', status: 'active', color: '#ef4444' },
    { id: '2', lat: 6.2, lng: -1.7, name: 'Obuasi Gold Fields', status: 'active', color: '#ef4444' },
    { id: '3', lat: 5.4, lng: -2.1, name: 'Prestea Mining Area', status: 'inactive', color: '#eab308' },
    { id: '4', lat: 6.6, lng: -1.2, name: 'Konongo Gold Mine', status: 'rehabilitated', color: '#22c55e' },
  ]

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiYW5kcmV3cXVhcmNvbzMzIiwiYSI6ImNsYm1jYjIybzEwcDczbnJmaW9zZjRyaDEifQ.rEcSdOhJUMfQQl8-xJPKdQ'

    // Initialize Mapbox
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-1.0232, 7.9465], // Ghana center [lng, lat]
      zoom: 6,
    })

    // Add default markers
    map.current.on('load', () => {
      if (map.current) {
        defaultPoints.forEach((point) => {
          const marker = new mapboxgl.Marker({
            color: point.color || '#3388ff',
            scale: 0.8
          })
            .setLngLat([point.lng, point.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-bold text-base">${point.name}</h3>
                    <p class="text-sm text-gray-600">${point.status || 'Unknown status'}</p>
                  </div>
                `)
            )
            .addTo(map.current!)
          
          markersRef.current.push(marker)
        })
      }
    })

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      // Remove map
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const addCustomPoint = () => {
    if (!map.current) return

    const newPoint: CustomPoint = {
      id: Date.now().toString(),
      lat: 6.0 + (Math.random() * 2 - 1),
      lng: -1.5 + (Math.random() * 2 - 1),
      name: `Custom Point ${customPoints.length + 1}`,
      color: '#3388ff'
    }

    const marker = new mapboxgl.Marker({
      color: newPoint.color,
      scale: 0.8
    })
      .setLngLat([newPoint.lng, newPoint.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-base">${newPoint.name}</h3>
            </div>
          `)
      )
      .addTo(map.current)

    markersRef.current.push(marker)
    setCustomPoints([...customPoints, newPoint])
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-10">
        <button
          onClick={addCustomPoint}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Add Point
        </button>
      </div>
    </div>
  )
}
