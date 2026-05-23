import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Region } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import {
  applyRegionsToSimplemap,
  attachSimplemapClickHandler,
  getSimplemapContainerId,
  loadSomaliaSimplemapsScripts,
  polishSimplemapLabels,
  SIMPLEMAP_CODE_TO_REGION_ID,
  zoomSimplemapToRegion,
} from '../utils/somaliaSimplemaps'
import {
  buildCmetExportImageUrl,
  CMET_CROP_SERVICE,
  fetchCmetLayerList,
  pickLatestCmetLayer,
  sortCmetLayersByDateDesc,
  type CmetLayerInfo,
} from '../utils/cmetMapServer'

interface InteractiveMapProps {
  regions: Region[]
  selectedRegion: string | null
  onRegionSelect: (regionId: string | null) => void
  loading: boolean
}

type CropKey = keyof typeof CMET_CROP_SERVICE

const CMET_LEGEND = [
  { label: 'Exceptional', color: '#008fc9' },
  { label: 'Favourable', color: '#43cf39' },
  { label: 'Watch', color: '#f5ef00' },
  { label: 'Poor', color: '#f15921' },
  { label: 'Failure', color: '#a80000' },
] as const

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
  const mapAreaRef = useRef<HTMLDivElement>(null)
  const [exportSize, setExportSize] = useState({ w: 1200, h: 900 })

  const [cmetEnabled, setCmetEnabled] = useState(false)
  const [cropKey, setCropKey] = useState<CropKey>('maize')
  const [cmetLayers, setCmetLayers] = useState<CmetLayerInfo[]>([])
  const [cmetLayer, setCmetLayer] = useState<CmetLayerInfo | null>(null)
  const [cmetLoading, setCmetLoading] = useState(false)
  const [cmetError, setCmetError] = useState<string | null>(null)

  useLayoutEffect(() => {
    const el = mapAreaRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const w = Math.min(1800, Math.max(640, Math.floor(r.width * 2)))
      const h = Math.min(1400, Math.max(480, Math.floor(r.height * 2)))
      setExportSize({ w, h })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mapBootstrapped, loading])

  useEffect(() => {
    if (!cmetEnabled) {
      setCmetLayers([])
      setCmetLayer(null)
      setCmetError(null)
      return
    }

    let cancelled = false
    setCmetLoading(true)
    setCmetError(null)

    fetchCmetLayerList(cropKey)
      .then((list) => {
        if (cancelled) return
        setCmetLayers(list)
        setCmetLayer(pickLatestCmetLayer(list))
      })
      .catch((e) => {
        if (cancelled) return
        setCmetError(e instanceof Error ? e.message : 'Could not load CMET layers')
        setCmetLayers([])
        setCmetLayer(null)
      })
      .finally(() => {
        if (!cancelled) setCmetLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [cmetEnabled, cropKey])

  const sortedLayerOptions = useMemo(() => sortCmetLayersByDateDesc(cmetLayers), [cmetLayers])

  const cmetImageUrl = useMemo(() => {
    if (!cmetEnabled || !cmetLayer) return null
    return buildCmetExportImageUrl(cropKey, cmetLayer.id, exportSize.w, exportSize.h)
  }, [cmetEnabled, cropKey, cmetLayer, exportSize.w, exportSize.h])

  useEffect(() => {
    if (loading || regions.length === 0) return

    let cancelled = false

    loadSomaliaSimplemapsScripts()
      .then(() => {
        if (cancelled) return
        attachSimplemapClickHandler((regionId) => {
          onRegionSelectRef.current(regionId)
          requestAnimationFrame(() => zoomSimplemapToRegion(regionId))
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
          requestAnimationFrame(() => polishSimplemapLabels())
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

  useEffect(() => {
    if (!mapBootstrapped) return
    zoomSimplemapToRegion(selectedRegion)
    if (!selectedRegion) return
    const code = Object.entries(SIMPLEMAP_CODE_TO_REGION_ID).find(([, rid]) => rid === selectedRegion)?.[0]
    if (!code) return
    const el = document.getElementById(code)
    if (!el) return
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, [mapBootstrapped, selectedRegion])

  const mapId = getSimplemapContainerId()

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-3">Interactive Map</h2>

      <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={cmetEnabled}
            onChange={(e) => setCmetEnabled(e.target.checked)}
          />
          <span className="font-medium">Crop conditions overlay</span>
          <span className="text-gray-500 font-normal">(CMET / Crop Monitor)</span>
        </label>

        {cmetEnabled && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Crop</span>
              <select
                value={cropKey}
                onChange={(e) => setCropKey(e.target.value as CropKey)}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {(Object.keys(CMET_CROP_SERVICE) as CropKey[]).map((k) => (
                  <option key={k} value={k}>
                    {k[0].toUpperCase() + k.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 min-w-[200px]">
              <span className="text-xs text-gray-600">Period</span>
              <select
                value={cmetLayer?.id ?? ''}
                disabled={sortedLayerOptions.length === 0 || cmetLoading}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  const found = sortedLayerOptions.find((l) => l.id === id)
                  if (found) setCmetLayer(found)
                }}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white flex-1 max-w-[280px]"
              >
                {sortedLayerOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name.replace(/\.tif$/i, '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {cmetLoading && <span className="text-xs text-gray-500">Loading layers…</span>}
            {cmetError && <span className="text-xs text-red-600">{cmetError}</span>}
          </>
        )}
      </div>

      {cmetEnabled && !cmetError && (
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-700 items-center">
          <span className="font-medium">Legend:</span>
          {CMET_LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border border-gray-300" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
          <a
            href="https://www.cropmonitor.org/early-warning-classification-system"
            target="_blank"
            rel="noreferrer"
            className="ml-auto underline"
            style={{ color: '#05556c' }}
          >
            Classification
          </a>
        </div>
      )}

      <div className="relative h-[600px] rounded-lg overflow-hidden border border-gray-200 bg-white">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 text-gray-500">
            Loading map...
          </div>
        )}
        <div ref={mapAreaRef} className="relative h-full w-full">
          <div id={mapId} className="h-full w-full [&_svg]:max-h-full relative z-0" />
          {cmetEnabled && cmetImageUrl && !cmetError && (
            <img
              src={cmetImageUrl}
              alt=""
              className="absolute inset-0 z-[5] h-full w-full object-cover opacity-[0.58] pointer-events-none mix-blend-multiply"
            />
          )}
        </div>
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
