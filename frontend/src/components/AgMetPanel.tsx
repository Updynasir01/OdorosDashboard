import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, BarChart3 } from 'lucide-react'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-gray-100 rounded animate-pulse" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {graphics.map((g) => {
            const rawTitle = titleFromUrl(g.url)
            return (
              <a
                key={g.url}
                href={g.url}
                target="_blank"
                rel="noreferrer"
                className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{prettyIndicatorName(rawTitle)}</p>
                  <p className="text-xs text-gray-500 truncate">{g.url}</p>
                </div>
                <div className="bg-gray-50">
                  <img
                    src={g.url}
                    alt={`AgMet chart: ${rawTitle}`}
                    loading="lazy"
                    className="w-full h-56 object-contain bg-white group-hover:bg-gray-50"
                  />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AgMetPanel

