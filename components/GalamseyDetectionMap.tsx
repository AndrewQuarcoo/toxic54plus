'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Mapbox to prevent SSR issues
const MapboxMap = dynamic(() => import('./MapboxMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface CustomPoint {
  id: string
  lat: number
  lng: number
  name: string
  status?: 'active' | 'inactive' | 'rehabilitated'
  color?: string
}

interface GalamseyDetectionMapProps {
  sites?: any[]
  selectedRegion: string
  onSiteClick?: (site: any) => void
}

export default function GalamseyDetectionMap({ selectedRegion, onSiteClick }: GalamseyDetectionMapProps) {
  return (
    <MapboxMap 
      selectedRegion={selectedRegion} 
      onSiteClick={onSiteClick} 
    />
  )
}