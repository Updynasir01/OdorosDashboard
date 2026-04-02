import { useEffect, useRef, useState } from 'react'
import { Region } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import {
  applyRegionsToSimplemap,
  attachSimplemapClickHandler,
  getSimplemapContainerId,
  loadSomaliaSimplemapsScripts,
} from '../utils/somaliaSimplemaps'

interface InteractiveMapProps {
  regions: Region[]
  selectedRegion: string | null
  onRegionSelect: (regionId: string | null) => void
  loading: boolean
}

declare global {
  interface Window {
    simplemaps_countrymap?: {
      load: () => void
      refresh: () => void
      hooks: {
        ready?: () => void
        click_state?: (id: string, ...args: unknown[]) => void
      }
    }
  }
}

function InteractiveMap({ regions, selectedRegion, onRegionSelect, loading }: InteractiveMapProps) {
  const { t } = useLanguage()
  const onRegionSelectRef = useRef(onRegionSelect)
  const regionsRef = useRef(regions)
  const selectedRegionRef = useRef(selectedRegion)
  onRegionSelectRef.current = onRegionSelect
  regionsRef.current = regions
  selectedRegionRef.current = selectedRegion

  const [mapBootstrapped, setMapBootstrapped] = useState(false)

  useEffect(() => {
    if (loading || regions.length === 0) return

    let cancelled = false

    loadSomaliaSimplemapsScripts()
      .then(() => {
        if (cancelled) return
        attachSimplemapClickHandler((regionId) => {
          onRegionSelectRef.current(regionId)
        })
        const api = window.simplemaps_countrymap
        if (!api || typeof api.load !== 'function' || !api.hooks) return

        const prevReady = api.hooks.ready
        api.hooks.ready = () => {
          if (typeof prevReady === 'function') prevReady()
          if (cancelled) return
          setMapBootstrapped(true)
          applyRegionsToSimplemap(regionsRef.current, selectedRegionRef.current, (level) =>
            t(`drought.${level}`)
          )
        }
        api.load()
      })
      .catch(() => {
        setMapBootstrapped(false)
      })

    return () => {
      cancelled = true
    }
  }, [loading, regions.length])

  useEffect(() => {
    if (!mapBootstrapped || loading) return
    applyRegionsToSimplemap(regions, selectedRegion, (level) => t(`drought.${level}`))
  }, [regions, selectedRegion, mapBootstrapped, loading, t])

  const mapId = getSimplemapContainerId()

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
      <div className="relative h-[600px] rounded-lg overflow-hidden border border-gray-200 bg-white">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 text-gray-500">
            Loading map...
          </div>
        )}
        <div id={mapId} className="h-full w-full [&_svg]:max-h-full" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
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
