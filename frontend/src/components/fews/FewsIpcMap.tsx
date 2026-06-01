import { useCallback, useEffect, useMemo, useState } from 'react'
import GeoJsonChoropleth from '../GeoJsonChoropleth'
import {
  IPC_PHASE_COLORS,
  IPC_PHASE_LABELS,
  availableIpcScenarios,
  filterIpcByScenario,
  harvestInsightsApi,
  type GeoJsonFeatureCollection,
} from '../../services/harvestInsights'

const SCENARIO_LABELS: Record<string, string> = {
  CS: 'Current Situation',
  ML1: 'Near-term Projection',
  ML2: 'Medium-term Projection',
}

export default function FewsIpcMap() {
  const [raw, setRaw] = useState<GeoJsonFeatureCollection | null>(null)
  const [scenario, setScenario] = useState('CS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    harvestInsightsApi
      .getStatus()
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    harvestInsightsApi
      .getIpcGeoJson()
      .then((data) => {
        setRaw(data)
        const scenarios = availableIpcScenarios(data)
        const preferred = ['CS', 'ML1', 'ML2'].find((s) => scenarios.includes(s))
        if (preferred) setScenario(preferred)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load IPC map'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => (raw ? filterIpcByScenario(raw, scenario) : null),
    [raw, scenario]
  )

  const scenarios = useMemo(() => (raw ? availableIpcScenarios(raw) : []), [raw])

  const colorForFeature = useCallback((props: Record<string, unknown>) => {
    const phase = parseInt(String(props.value ?? '0'), 10)
    return IPC_PHASE_COLORS[phase] || '#cccccc'
  }, [])

  const legendItems = useMemo(() => {
    if (!filtered) return []
    const phases = new Set<number>()
    filtered.features.forEach((f) => {
      const p = parseInt(String(f.properties.value ?? '0'), 10)
      if (p >= 1 && p <= 5) phases.add(p)
    })
    return [...phases].sort().map((p) => ({ phase: p, label: IPC_PHASE_LABELS[p], color: IPC_PHASE_COLORS[p] }))
  }, [filtered])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Acute food insecurity (IPC)</h2>
      <p className="text-sm text-gray-500 mb-4">
        FEWS NET classification via Harvest Portal GeoJSON
        {!configured && ' — requires HARVEST_PORTAL_API_KEY on backend'}
      </p>

      {scenarios.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {scenarios.map((s) => (
              <option key={s} value={s}>
                {SCENARIO_LABELS[s] || s}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="text-gray-500 py-12 text-center">Loading IPC map…</p>}
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
          {!configured && (
            <p className="mt-2">
              Add <code className="bg-amber-100 px-1 rounded">HARVEST_PORTAL_API_KEY</code> to backend/.env and restart
              the server.
            </p>
          )}
        </div>
      )}

      {!loading && !error && filtered && filtered.features.length > 0 && (
        <>
          <GeoJsonChoropleth geojson={filtered} colorForFeature={colorForFeature} />
          <div className="flex flex-wrap gap-3 mt-4">
            {legendItems.map((item) => (
              <span key={item.phase} className="inline-flex items-center gap-2 text-xs text-gray-600">
                <span className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm max-h-48 overflow-y-auto">
            {filtered.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{
                    backgroundColor: colorForFeature(f.properties),
                  }}
                />
                <span className="truncate">
                  {String(f.properties.geographic_unit_name || f.properties.name || `Unit ${i + 1}`)}
                  {' — IPC '}
                  {String(f.properties.value ?? '?')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
