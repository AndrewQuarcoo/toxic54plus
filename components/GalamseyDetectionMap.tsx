'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface GalamseySite {
  id: string
  name: string
  lat: number
  lng: number
  status: 'active' | 'inactive' | 'rehabilitated'
  size: 'small' | 'medium' | 'large'
  lastUpdated: string
  region: string
  confidence: number
  area: number
  degradationLevel: 'low' | 'medium' | 'high'
  satelliteImage?: string
  detectionMethod: 'sentinel-1' | 'sentinel-2' | 'planet-nicfi' | 'unet-deep-learning'
}

interface GalamseyDetectionMapProps {
  sites: GalamseySite[]
  selectedRegion: string
  onSiteClick?: (site: GalamseySite) => void
}

function GalamseyDetectionMapComponent({ sites, selectedRegion, onSiteClick }: GalamseyDetectionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiYW5kcmV3cXVhcmNvbzMzIiwiYSI6ImNsYm1jYjIybzEwcDczbnJmaW9zZjRyaDEifQ.rEcSdOhJUMfQQl8-xJPKdQ'

    // Initialize Mapbox
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-1.0232, 7.9465], // Ghana center [lng, lat]
      zoom: 6.5,
    })

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    // Add markers when map loads
    map.current.on('load', () => {
      if (map.current) {
        addMarkersForSites(sites)
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

  // Update markers when sites change
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return
    
    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Add new markers
    addMarkersForSites(sites)
  }, [sites, selectedRegion])

  const addMarkersForSites = (sitesList: GalamseySite[]) => {
    if (!map.current) return

    // Filter sites by region if needed
    let filteredSites = sitesList
    if (selectedRegion !== 'all') {
      filteredSites = sitesList.filter(site => 
        site.region.toLowerCase() === selectedRegion.toLowerCase()
      )
    }

    filteredSites.forEach((site) => {
      // Determine color based on status
      let color = '#3388ff'
      if (site.status === 'active') {
        color = '#ef4444' // Red for active
      } else if (site.status === 'inactive') {
        color = '#eab308' // Yellow for inactive
      } else if (site.status === 'rehabilitated') {
        color = '#22c55e' // Green for rehabilitated
      }

      // Create marker with custom HTML
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = color
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([site.lng, site.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: 'galamsey-popup' })
            .setHTML(`
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${site.name}</h3>
                <p style="margin: 2px 0; font-size: 12px; color: #666;">
                  <strong>Status:</strong> <span style="color: ${color};">${site.status}</span>
                </p>
                <p style="margin: 2px 0; font-size: 12px; color: #666;">
                  <strong>Region:</strong> ${site.region}
                </p>
                <p style="margin: 2px 0; font-size: 12px; color: #666;">
                  <strong>Confidence:</strong> ${(site.confidence * 100).toFixed(1)}%
                </p>
                <p style="margin: 2px 0; font-size: 12px; color: #666;">
                  <strong>Area:</strong> ${site.area.toFixed(2)} km²
                </p>
              </div>
            `)
        )
        .addTo(map.current!)
      
      // Add click handler if onSiteClick is provided
      if (onSiteClick) {
        el.addEventListener('click', () => onSiteClick(site))
        marker.getElement().addEventListener('click', () => {
          marker.togglePopup()
        })
      }

      markersRef.current.push(marker)
    })

    // If we have sites, fit bounds to show all markers
    if (filteredSites.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      filteredSites.forEach(site => {
        bounds.extend([site.lng, site.lat])
      })
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10
      })
    }
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}

// Export with dynamic import to prevent SSR issues with mapbox
export default function GalamseyDetectionMap(props: GalamseyDetectionMapProps) {
  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-96 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
  
  return <GalamseyDetectionMapComponent {...props} />
}