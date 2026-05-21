import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import InteractiveMap from '../components/InteractiveMap'
import type { Region } from '../types'
import { apiService } from '../services/api'
import { agmetService, type AgMetAdminUnitItem, type AgMetAvailableGraphicItem } from '../services/agmet'

const SOMALIA_ADM1_COUNTRY_CODE = '963'

function humanizeRegionId(regionId: string): string {
  return regionId.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function sortCharts(urls: AgMetAvailableGraphicItem[]): AgMetAvailableGraphicItem[] {
  // Put common ones first if present
  const order = ['condition', 'ndvi', 'precip', 'precipitation', 'swf', 'esi', 'temperature']
  const score = (u: string) => {
    const parts = u.toLowerCase().split('/')
    const idx = parts.findIndex((p) => order.includes(p))
    return idx === -1 ? 999 : order.indexOf(parts[idx])
  }
  return [...urls].sort((a, b) => score(a.url) - score(b.url))
}

function chartTitleFromUrl(url: string): string {
  // Example:
  // https://cropmonitortools.org/agmet/somalia/mz_s1_2025/condition/adm1/awdal.jpg
  const parts = url.split('/').filter(Boolean)
  const indicator = parts[parts.length - 3] || 'chart'
  const regionFile = parts[parts.length - 1] || ''
  const region = regionFile.replace(/\.jpg$/i, '').replace(/[-_]/g, ' ')
  const label = indicator.replace(/[-_]/g, ' ')
  return region ? `${label} — ${region}` : label
}

function AgMetDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [regions, setRegions] = useState<Region[]>([])
  const [loadingRegions, setLoadingRegions] = useState(true)

  const [season, setSeason] = useState<'s1' | 's2'>('s2') // maize 1 vs maize 2
  const [cropSeasonYearCode, setCropSeasonYearCode] = useState<string | null>(null)
  const [adminUnits, setAdminUnits] = useState<AgMetAdminUnitItem[]>([])
  const [charts, setCharts] = useState<AgMetAvailableGraphicItem[]>([])
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const regionDisplayName = useMemo(() => {
    if (!selectedRegion) return null
    return humanizeRegionId(selectedRegion)
  }, [selectedRegion])

  useEffect(() => {
    let cancelled = false
    async function loadRegions() {
      try {
        setLoadingRegions(true)
        const data = await apiService.getRegions()
        if (!cancelled) setRegions(data)
      } catch {
        if (!cancelled) setRegions([])
      } finally {
        if (!cancelled) setLoadingRegions(false)
      }
    }
    loadRegions()
    return () => {
      cancelled = true
    }
  }, [])

  // Load latest maize season/year code + admin units for Somalia
  useEffect(() => {
    let cancelled = false
    async function loadAgmetMeta() {
      try {
        setError(null)
        const codes = await agmetService.getCropSeasonYearCodes(SOMALIA_ADM1_COUNTRY_CODE, 'adm1')
        const latest = agmetService.pickLatestMaizeCropSeasonYearCode(codes, season)
        if (!latest) throw new Error(`No Somalia maize ${season.toUpperCase()} crop/season/year found in AgMet`)
        if (cancelled) return
        setCropSeasonYearCode(latest)

        const units = await agmetService.getSubnationalAdminUnitCodes(SOMALIA_ADM1_COUNTRY_CODE, 'adm1', latest)
        if (cancelled) return
        setAdminUnits(units)
      } catch (e: any) {
        if (cancelled) return
        setCropSeasonYearCode(null)
        setAdminUnits([])
        setError(e?.message || 'Failed to load AgMet metadata')
      }
    }

    loadAgmetMeta()
    return () => {
      cancelled = true
    }
  }, [season])

  // Load charts whenever selection changes
  useEffect(() => {
    let cancelled = false
    async function loadCharts() {
      try {
        setLoadingCharts(true)
        setError(null)
        setCharts([])

        if (!cropSeasonYearCode) {
          setLoadingCharts(false)
          return
        }

        const year = Number(cropSeasonYearCode.split('_').pop() || '')
        const seasonCode = (cropSeasonYearCode.split('_')[1] || '').toLowerCase()

        let adminUnitCode: string | undefined = undefined
        if (regionDisplayName && adminUnits.length > 0) {
          adminUnitCode = agmetService.findAdminUnitByName(adminUnits, regionDisplayName)?.adminUnitCode
        }

        const available = await agmetService.getAvailableAgMetGraphics({
          countryCode: SOMALIA_ADM1_COUNTRY_CODE,
          cropCode: 'mz',
          seasonCode,
          year: Number.isFinite(year) ? year : undefined,
          adminTypeCode: 'adm1',
          adminUnitCode,
        })

        if (cancelled) return
        setCharts(sortCharts(available).slice(0, 24))
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message || 'Failed to load AgMet charts')
        setCharts([])
      } finally {
        if (!cancelled) setLoadingCharts(false)
      }
    }

    loadCharts()
    return () => {
      cancelled = true
    }
  }, [cropSeasonYearCode, regionDisplayName, adminUnits])

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#05556c' }}>
              Odoros crop charts Somalia
            </h1>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Crop</span>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as 's1' | 's2')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="s1">Maize 1 (Season 1)</option>
              <option value="s2">Maize 2 (Season 2)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Gobol</span>
            <select
              value={selectedRegion || ''}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[220px]"
            >
              <option value="">National snapshot</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {cropSeasonYearCode ? (
              <>
                Latest: <span className="font-mono">{cropSeasonYearCode}</span>
              </>
            ) : (
              'Loading latest season…'
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Somalia map (select gobol)</h2>
              <InteractiveMap
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionSelect={setSelectedRegion}
                loading={loadingRegions}
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Click a gobol on the map, or use the region dropdown in the top bar.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedRegion ? `Charts — ${regionDisplayName}` : 'Charts — National snapshot'}
                </h2>
              </div>

              {error ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>
              ) : loadingCharts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : charts.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No charts available for this selection.</p>
              ) : (
                <div className="space-y-6">
                  {/* Make the first chart big (usually condition) */}
                  {charts[0] && (
                    <a
                      href={charts[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white block"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{chartTitleFromUrl(charts[0].url)}</p>
                      </div>
                      <div className="bg-gray-50">
                        <img
                          src={charts[0].url}
                          alt="AgMet chart"
                          loading="lazy"
                          className="w-full h-[520px] object-contain bg-white group-hover:bg-gray-50"
                        />
                      </div>
                    </a>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {charts.slice(1).map((c) => (
                    <a
                      key={c.url}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {chartTitleFromUrl(c.url)}
                        </p>
                      </div>
                      <div className="bg-gray-50">
                        <img
                          src={c.url}
                          alt="AgMet chart"
                          loading="lazy"
                          className="w-full h-80 object-contain bg-white group-hover:bg-gray-50"
                        />
                      </div>
                    </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgMetDashboard

