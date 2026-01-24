import { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { Region } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface InteractiveMapProps {
  regions: Region[]
  selectedRegion: string | null
  onRegionSelect: (regionId: string | null) => void
  loading: boolean
}

// Somalia approximate center
const SOMALIA_CENTER: [number, number] = [5.1521, 46.1996]

function MapUpdater({ selectedRegion, regions }: { selectedRegion: string | null; regions: Region[] }) {
  const map = useMap()

  useEffect(() => {
    if (selectedRegion && regions.length > 0) {
      const region = regions.find((r) => r.id === selectedRegion)
      if (region && region.coordinates.length > 0) {
        // Calculate center of region
        const lats = region.coordinates.map((c) => c[0])
        const lngs = region.coordinates.map((c) => c[1])
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
        map.setView([centerLat, centerLng], 7)
      }
    }
  }, [selectedRegion, regions, map])

  return null
}

function InteractiveMap({ regions, selectedRegion, onRegionSelect, loading }: InteractiveMapProps) {
  const { t, language } = useLanguage()

  const getDroughtColor = (level: string) => {
    switch (level) {
      case 'normal':
        return '#10b981' // Green
      case 'watch':
        return '#fbbf24' // Yellow
      case 'warning':
        return '#f97316' // Orange
      case 'emergency':
        return '#ef4444' // Red
      default:
        return '#6b7280' // Gray
    }
  }

  const getRegionStyle = (region: Region) => {
    return {
      fillColor: getDroughtColor(region.droughtLevel),
      fillOpacity: 0.6,
      color: '#fff',
      weight: 2,
      opacity: 1,
    }
  }

  const onEachRegion = (feature: any, layer: L.Layer) => {
    const region = regions.find((r) => r.id === feature.properties.id)
    if (!region) return

    layer.on({
      click: () => onRegionSelect(region.id),
      mouseover: (e: L.LeafletMouseEvent) => {
        const layer = e.target
        layer.setStyle({
          fillOpacity: 0.8,
          weight: 3,
        })
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const layer = e.target
        layer.setStyle(getRegionStyle(region))
      },
    })

    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${language === 'so' ? region.nameSomali : region.name}</h3>
        <div class="space-y-1 text-sm">
          <p><strong>Drought Level:</strong> <span class="px-2 py-1 rounded text-white" style="background-color: ${getDroughtColor(region.droughtLevel)}">${t(`drought.${region.droughtLevel}`)}</span></p>
          <p><strong>Rainfall Deficit:</strong> ${region.rainfallDeficit}%</p>
          <p><strong>Last Rainfall:</strong> ${new Date(region.lastRainfallDate).toLocaleDateString()}</p>
          <p><strong>Affected Population:</strong> ${region.affectedPopulation.toLocaleString()}</p>
          <p><strong>NDVI:</strong> ${region.ndvi.toFixed(2)}</p>
        </div>
      </div>
    `

    layer.bindPopup(popupContent)
  }

  // Convert regions to GeoJSON format
  const geoJsonData = {
    type: 'FeatureCollection' as const,
    features: regions.map((region) => ({
      type: 'Feature' as const,
      properties: {
        id: region.id,
        name: region.name,
        nameSomali: region.nameSomali,
        droughtLevel: region.droughtLevel,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [region.coordinates],
      },
    })),
  }

  if (loading) {
    return (
      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
      <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={SOMALIA_CENTER}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater selectedRegion={selectedRegion} regions={regions} />
          <GeoJSON
            data={geoJsonData as any}
            style={(feature) => {
              const region = regions.find((r) => r.id === feature?.properties.id)
              return region ? getRegionStyle(region) : {}
            }}
            onEachFeature={onEachRegion}
          />
        </MapContainer>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span>{t('drought.normal')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span>{t('drought.watch')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
          <span>{t('drought.warning')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span>{t('drought.emergency')}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{t('map.clickRegion')}</p>
    </div>
  )
}

export default InteractiveMap

