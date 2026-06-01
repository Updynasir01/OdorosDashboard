import { useEffect, useState } from 'react'
import {
  REFERENCE_MAP_CONTAINER_ID,
  applyNeutralReferenceMap,
  attachSimplemapClickHandler,
  loadSomaliaSimplemapsScripts,
  polishSimplemapLabels,
  zoomSimplemapToRegion,
} from '../utils/somaliaSimplemaps'

interface SomaliaReferenceMapProps {
  selectedRegion?: string | null
  onRegionSelect?: (regionId: string) => void
  className?: string
}

declare global {
  interface Window {
    simplemaps_countrymap?: {
      load: () => void
      refresh: () => void
      hooks: { ready?: () => void; click_state?: (id: string, ...args: unknown[]) => void }
    }
  }
}

export default function SomaliaReferenceMap({
  selectedRegion = null,
  onRegionSelect,
  className = '',
}: SomaliaReferenceMapProps) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadSomaliaSimplemapsScripts(REFERENCE_MAP_CONTAINER_ID)
      .then(() => {
        if (cancelled) return
        if (onRegionSelect) {
          attachSimplemapClickHandler((regionId: string) => {
            onRegionSelect(regionId)
            requestAnimationFrame(() => zoomSimplemapToRegion(regionId, REFERENCE_MAP_CONTAINER_ID))
          })
        }
        const api = window.simplemaps_countrymap
        if (!api?.load) return

        const prevReady = api.hooks?.ready
        api.hooks.ready = () => {
          if (typeof prevReady === 'function') prevReady()
          if (cancelled) return
          applyNeutralReferenceMap(REFERENCE_MAP_CONTAINER_ID)
          setReady(true)
        }
        api.load()
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load map')
      })

    return () => {
      cancelled = true
    }
  }, [onRegionSelect])

  useEffect(() => {
    if (!ready) return
    zoomSimplemapToRegion(selectedRegion, REFERENCE_MAP_CONTAINER_ID)
    polishSimplemapLabels(REFERENCE_MAP_CONTAINER_ID)
  }, [ready, selectedRegion])

  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-800 mb-2">Somalia gobol map</p>
      <p className="text-xs text-gray-500 mb-3">Use this to locate each region on the Horn of Africa crop layer →</p>
      <div className="relative h-[420px] rounded-lg overflow-hidden border border-gray-200 bg-white">
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Loading map…</div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-600 text-sm px-4 text-center">
            {error}
          </div>
        )}
        <div id={REFERENCE_MAP_CONTAINER_ID} className="h-full w-full [&_svg]:max-h-full" />
      </div>
    </div>
  )
}
