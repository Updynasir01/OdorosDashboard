import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { harvestInsightsApi, type MarketPricePoint } from '../../services/harvestInsights'

const DEFAULT_PRODUCT = 'Maize Grain (White)'
const DEFAULT_MARKET = 'Afgoi'
const DEFAULT_UNIT = 'kg'
const DEFAULT_PRICE_TYPE = 'Retail'

export default function MarketPriceChart() {
  const [products, setProducts] = useState<string[]>([])
  const [markets, setMarkets] = useState<string[]>([])
  const [units, setUnits] = useState<string[]>([])
  const [priceTypes, setPriceTypes] = useState<string[]>([])
  const [product, setProduct] = useState(DEFAULT_PRODUCT)
  const [market, setMarket] = useState(DEFAULT_MARKET)
  const [unit, setUnit] = useState(DEFAULT_UNIT)
  const [priceType, setPriceType] = useState(DEFAULT_PRICE_TYPE)
  const [series, setSeries] = useState<MarketPricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    harvestInsightsApi
      .getStatus()
      .then((s) => {
        setConfigured(s.configured)
        if (!s.configured) {
          setError(s.message)
          setLoading(false)
        }
      })
      .catch(() => setConfigured(false))
  }, [])

  useEffect(() => {
    if (!configured) return
    harvestInsightsApi
      .getMarketProducts()
      .then((list) => {
        setProducts(list)
        if (list.includes(DEFAULT_PRODUCT)) setProduct(DEFAULT_PRODUCT)
        else if (list[0]) setProduct(list[0])
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load products'))
  }, [configured])

  useEffect(() => {
    if (!configured || !product) return
    harvestInsightsApi
      .getMarketOptions(product)
      .then((opts) => {
        setMarkets(opts.markets)
        if (opts.markets.includes(DEFAULT_MARKET)) setMarket(DEFAULT_MARKET)
        else if (opts.markets[0]) setMarket(opts.markets[0])
      })
      .catch(() => setMarkets([]))
  }, [configured, product])

  useEffect(() => {
    if (!configured || !product || !market) return
    harvestInsightsApi
      .getMarketOptions(product, market)
      .then((opts) => {
        setUnits(opts.units)
        if (opts.units.includes(DEFAULT_UNIT)) setUnit(DEFAULT_UNIT)
        else if (opts.units[0]) setUnit(opts.units[0])
      })
      .catch(() => setUnits([]))
  }, [configured, product, market])

  useEffect(() => {
    if (!configured || !product || !market || !unit) return
    harvestInsightsApi
      .getMarketOptions(product, market, unit)
      .then((opts) => {
        setPriceTypes(opts.priceTypes)
        if (opts.priceTypes.includes(DEFAULT_PRICE_TYPE)) setPriceType(DEFAULT_PRICE_TYPE)
        else if (opts.priceTypes[0]) setPriceType(opts.priceTypes[0])
      })
      .catch(() => setPriceTypes([]))
  }, [configured, product, market, unit])

  useEffect(() => {
    if (!configured || !product || !market || !unit || !priceType) return
    setLoading(true)
    setError(null)
    harvestInsightsApi
      .getMarketSeries({ product, market, unit, priceType })
      .then(setSeries)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load prices'))
      .finally(() => setLoading(false))
  }, [configured, product, market, unit, priceType])

  const chartData = useMemo(
    () =>
      series.map((p) => ({
        date: p.period_date,
        price: p.price,
        label: new Date(p.period_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      })),
    [series]
  )

  const latest = series[series.length - 1]
  const yearAgo = series.length > 12 ? series[series.length - 13] : null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Market price monitor</h2>
      <p className="text-sm text-gray-500 mb-4">FEWS NET market prices via Harvest Portal (Somalia)</p>

      {!configured && error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-4">
          {error}. Add HARVEST_PORTAL_API_KEY to backend/.env.
        </div>
      )}

      {configured && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <FilterSelect label="Product" value={product} options={products} onChange={setProduct} />
          <FilterSelect label="Market" value={market} options={markets} onChange={setMarket} />
          <FilterSelect label="Unit" value={unit} options={units} onChange={setUnit} />
          <FilterSelect label="Price type" value={priceType} options={priceTypes} onChange={setPriceType} />
        </div>
      )}

      {latest && (
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <Stat label="Latest price" value={`${latest.price} ${latest.currency || ''}/${latest.unit}`} />
          {yearAgo && (
            <Stat
              label="vs ~1 year ago"
              value={`${(((latest.price - yearAgo.price) / yearAgo.price) * 100).toFixed(1)}%`}
            />
          )}
          <Stat label="Observations" value={String(series.length)} />
        </div>
      )}

      {loading && <p className="text-gray-500 py-12 text-center">Loading price series…</p>}
      {error && configured && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v.toFixed(2), 'Price']} />
            <Bar dataKey="price" fill="#05556c" opacity={0.35} />
            <Line type="monotone" dataKey="price" stroke="#05556c" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
        disabled={options.length === 0}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  )
}
