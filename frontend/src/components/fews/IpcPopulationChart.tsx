import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fewsInsightsApi, type IpcPopulationRecord } from '../../services/harvestInsights'

export default function IpcPopulationChart() {
  const [scenario, setScenario] = useState('CS')
  const [records, setRecords] = useState<IpcPopulationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fewsConfigured, setFewsConfigured] = useState(false)

  useEffect(() => {
    fewsInsightsApi.getStatus().then((s) => setFewsConfigured(s.configured))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fewsInsightsApi
      .getIpcPopulation(scenario)
      .then(setRecords)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load IPC population data'))
      .finally(() => setLoading(false))
  }, [scenario])

  const chartData = useMemo(
    () =>
      [...records]
        .sort((a, b) => new Date(a.reporting_date).getTime() - new Date(b.reporting_date).getTime())
        .map((r) => ({
          date: new Date(r.reporting_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          high: r.high_value,
          low: r.low_value,
          range: r.population_range,
          phase: r.phase_name,
        })),
    [records]
  )

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold">Acutely food insecure population</h2>
          <p className="text-sm text-gray-500 mt-1">FEWS NET IPC population size — Somalia</p>
        </div>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="CS">Current Situation (CS)</option>
          <option value="ML">Medium-term Projection (ML)</option>
        </select>
      </div>

      {loading && <p className="text-gray-500 py-12 text-center">Loading chart…</p>}
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
          {!fewsConfigured && (
            <p className="mt-2">
              Optional: set <code className="bg-amber-100 px-1 rounded">FEWS_JWT_TOKEN</code> or FEWS username/password
              on the backend, or request API access from FEWS NET.
            </p>
          )}
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <p className="text-gray-500 py-8 text-center">No population records returned for this scenario.</p>
      )}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'high' ? 'High estimate' : 'Low estimate',
              ]}
            />
            <Area type="monotone" dataKey="high" stackId="1" stroke="#dc2626" fill="#fecaca" name="high" />
            <Area type="monotone" dataKey="low" stackId="2" stroke="#ea580c" fill="#fed7aa" name="low" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
