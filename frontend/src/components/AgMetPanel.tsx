import { useEffect, useMemo, useState } from 'react'
import {
  ExternalLink,
  BarChart3,
  Droplets,
  Leaf,
  Thermometer,
  Waves,
  Activity,
  Sprout,
  LineChart,
  type LucideIcon,
} from 'lucide-react'
import { agmetService, type AgMetAvailableGraphicItem } from '../services/agmet'

interface AgMetPanelProps {
  regionId?: string
}

const SOMALIA_ADM1_COUNTRY_CODE = '963'
const ADMIN_TYPE: 'adm1' = 'adm1'

function titleFromUrl(url: string): string {
  // Example:
  // https://cropmonitortools.org/agmet/somalia/mz_s2_2026/condition/adm1/awdal.jpg
  const parts = url.split('/').filter(Boolean)
  const idx = parts.findIndex((p) => p === 'somalia')
  const maybe = idx >= 0 ? parts.slice(idx + 2) : parts.slice(-3)
  const indicator = maybe[0] || 'AgMet'
  return indicator.replace(/[-_]/g, ' ')
}

function slugFromUrl(url: string): string {
  const raw = titleFromUrl(url)
  return raw.toLowerCase().trim().split(/\s+/)[0] || 'chart'
}

function prettyIndicatorName(raw: string): string {
  const s = raw.toLowerCase().trim()
  const map: Record<string, string> = {
    condition: 'Crop condition',
    ndvi: 'NDVI',
    precip: 'Precipitation',
    precipitation: 'Precipitation',
    temperature: 'Temperature',
    esi: 'Evaporative Stress Index (ESI)',
    swf: 'Soil water fraction',
    soil: 'Soil water fraction',
  }
  return map[s] || raw.charAt(0).toUpperCase() + raw.slice(1)
}

const agmetIconBySlug: Record<string, LucideIcon> = {
  condition: Sprout,
  ndvi: Leaf,
  precip: Droplets,
  precipitation: Droplets,
  temperature: Thermometer,
  swf: Waves,
  soil: Waves,
  esi: Activity,
  chart: LineChart,
}

function guessRegionDisplayNameFromId(regionId?: string): string {
  if (!regionId) return 'Somalia'
  return regionId.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function AgMetPanel({ regionId }: AgMetPanelProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [graphics, setGraphics] = useState<AgMetAvailableGraphicItem[]>([])
  const [selectedCropSeasonYear, setSelectedCropSeasonYear] = useState<string | null>(null)
  const regionDisplayName = useMemo(() => guessRegionDisplayNameFromId(regionId), [regionId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const cropSeasonYears = await agmetService.getCropSeasonYearCodes(SOMALIA_ADM1_COUNTRY_CODE, ADMIN_TYPE)
        const latestMaize = agmetService.pickLatestMaizeSeasonCode(cropSeasonYears)
        if (!latestMaize) {
          throw new Error('No maize crop/season/year found for Somalia in AgMet')
        }

        if (!cancelled) setSelectedCropSeasonYear(latestMaize)

        const adminUnits = await agmetService.getSubnationalAdminUnitCodes(
          SOMALIA_ADM1_COUNTRY_CODE,
          ADMIN_TYPE,
          latestMaize
        )

        const selectedUnit = regionId
          ? agmetService.findAdminUnitByRegionName(adminUnits, regionDisplayName)
          : null

        // If no region is selected (or mapping fails), show a few charts across the country.
        const adminUnitCode = selectedUnit?.adminUnitCode

        const year = Number(latestMaize.split('_').pop() || '')
        const seasonCode = (latestMaize.split('_')[1] || '').toLowerCase() // s1 or s2

        const available = await agmetService.getAvailableAgMetGraphics({
          countryCode: SOMALIA_ADM1_COUNTRY_CODE,
          cropCode: 'mz',
          seasonCode,
          year: Number.isFinite(year) ? year : undefined,
          adminTypeCode: ADMIN_TYPE,
          adminUnitCode,
        })

        if (cancelled) return

        // De-dupe and keep a small set for display
        const seen = new Set<string>()
        const limited = available.filter((g) => {
          if (!g?.url) return false
          if (seen.has(g.url)) return false
          seen.add(g.url)
          return true
        })

        setGraphics(limited.slice(0, 12))
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message || 'Failed to load AgMet charts')
        setGraphics([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [regionId, regionDisplayName])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-semibold">AgMet (Real EO Charts)</h2>
          <span className="text-sm text-gray-500">
            {regionId ? `— ${regionDisplayName}` : '— National snapshot'}
          </span>
        </div>
        <a
          href="https://cropmonitortools.org/tools/agmet/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900"
        >
          Open AgMet <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {selectedCropSeasonYear ? (
        <p className="text-xs text-gray-500 mb-4">Latest maize season: {selectedCropSeasonYear}</p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-20 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
          <div className="text-xs text-red-700/80 mt-2">
            AgMet API: <span className="font-mono">https://agmet.cropmonitortools.org/api</span>
          </div>
        </div>
      ) : graphics.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No AgMet charts available for this selection.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {graphics.map((g) => {
            const rawTitle = titleFromUrl(g.url)
            const slug = slugFromUrl(g.url)
            const Icon = agmetIconBySlug[slug] || agmetIconBySlug.chart
            const label = prettyIndicatorName(rawTitle)
            return (
              <a
                key={g.url}
                href={g.url}
                target="_blank"
                rel="noreferrer"
                className="group bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow block"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-bold text-green-600" title="Live AgMet chart">
                    ↗
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1 line-clamp-2">{label}</h3>
                <div className="mt-1 mb-2 h-24 w-full rounded-md bg-gray-50 border border-gray-100 overflow-hidden">
                  <img
                    src={g.url}
                    alt={`AgMet: ${label}`}
                    loading="lazy"
                    className="w-full h-full object-contain bg-white group-hover:bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Season: {g.cropSeasonYearCode || selectedCropSeasonYear || '—'}
                </p>
                <p className="text-xs mt-1 text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    Open full chart <ExternalLink className="w-3 h-3" />
                  </span>
                </p>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AgMetPanel

