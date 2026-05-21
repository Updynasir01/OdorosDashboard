import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import TopBar from '../components/TopBar'
import {
  aggregatePartnerValues,
  fetchSomaliaTrades,
  fetchTradeModels,
  formatTradeValueThousands,
  type TradeMode,
} from '../services/resourceTrade'

const YEARS = Array.from({ length: 16 }, (_, i) => 2010 + i)

function TradeFlowPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const [mode, setMode] = useState<TradeMode>('exports')
  const [year, setYear] = useState(2022)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartRows, setChartRows] = useState<
    { name: string; valueThousands: number; formatted: string }[]
  >([])
  const [totalThousands, setTotalThousands] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchTradeModels()
      .then((m) => {
        if (cancelled) return
        setCategories(m.categories || [])
      })
      .catch(() => {
        if (cancelled) return
        setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadTrades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSomaliaTrades(mode, year, categoryId)
      const agg = aggregatePartnerValues(mode, data)
      const sumAll = agg.reduce((s, r) => s + r.value, 0)
      setTotalThousands(sumAll)
      setChartRows(
        agg.slice(0, 24).map((r) => ({
          name: r.name.length > 28 ? `${r.name.slice(0, 26)}…` : r.name,
          valueThousands: r.value,
          formatted: formatTradeValueThousands(r.value),
        }))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trade data')
      setChartRows([])
      setTotalThousands(0)
    } finally {
      setLoading(false)
    }
  }, [mode, year, categoryId])

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  const totalLabel = useMemo(() => formatTradeValueThousands(totalThousands), [totalThousands])

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#05556c' }}>
              Trade flows — Somalia
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Partner countries by trade value (ResourceTrade.earth, Chatham House). Values in thousands USD.
            </p>
          </div>
          <Link
            to="/"
            className="text-sm font-medium px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            style={{ color: '#05556c' }}
          >
            ← Main dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-4 mb-6">
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-1">Direction</span>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  mode === 'exports' ? 'text-white' : 'bg-white text-gray-700'
                }`}
                style={mode === 'exports' ? { backgroundColor: '#05556c' } : {}}
                onClick={() => setMode('exports')}
              >
                Exports from Somalia
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  mode === 'imports' ? 'text-white' : 'bg-white text-gray-700'
                }`}
                style={mode === 'imports' ? { backgroundColor: '#05556c' } : {}}
                onClick={() => setMode('imports')}
              >
                Imports to Somalia
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[100px]"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Commodity category</label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setCategoryId(v === '' ? null : Number(v))
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full max-w-md"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-700 pb-2">
            Top partners total: <span className="font-semibold">{totalLabel}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 min-h-[480px]">
          {loading && (
            <div className="flex items-center justify-center h-64 text-gray-500">Loading trade data…</div>
          )}
          {!loading && error && (
            <div className="rounded-md bg-red-50 text-red-800 px-4 py-3 text-sm">{error}</div>
          )}
          {!loading && !error && chartRows.length === 0 && (
            <div className="text-gray-600 text-sm">No rows returned for this year and filter.</div>
          )}
          {!loading && !error && chartRows.length > 0 && (
            <ResponsiveContainer width="100%" height={520}>
              <BarChart
                data={chartRows}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatTradeValueThousands(Number(v))} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [formatTradeValueThousands(value), 'Value (USD, thousands)']}
                  labelStyle={{ color: '#111' }}
                />
                <Bar dataKey="valueThousands" fill="#05556c" radius={[0, 4, 4, 0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Source:{' '}
          <a
            href="https://resourcetrade.earth/"
            target="_blank"
            rel="noreferrer"
            className="underline"
            style={{ color: '#05556c' }}
          >
            resourcetrade.earth
          </a>{' '}
          (Chatham House). M49 706 = Somalia.
        </p>
      </div>
    </div>
  )
}

export default TradeFlowPage
