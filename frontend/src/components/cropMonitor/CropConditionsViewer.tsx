import { useEffect, useState } from 'react'
import {
  buildCmetExportImageUrl,
  fetchCmetLayerList,
  pickLatestCmetLayer,
  sortCmetLayersByDateDesc,
  type CmetLayerInfo,
} from '../../utils/cmetMapServer'
import SomaliaReferenceMap from '../SomaliaReferenceMap'

const CMET_LEGEND = [
  { label: 'Exceptional', color: '#008fc9' },
  { label: 'Favourable', color: '#43cf39' },
  { label: 'Watch', color: '#f5ef00' },
  { label: 'Poor', color: '#f15921' },
  { label: 'Failure', color: '#a80000' },
] as const

const CROP_KEYS = ['maize', 'wheat', 'rice', 'soybean', 'sorghum', 'millet'] as const
type CropKey = (typeof CROP_KEYS)[number]

export default function CropConditionsViewer() {
  const [crop, setCrop] = useState<CropKey>('maize')
  const [layers, setLayers] = useState<CmetLayerInfo[]>([])
  const [layer, setLayer] = useState<CmetLayerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightRegion, setHighlightRegion] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchCmetLayerList(crop)
        const sorted = sortCmetLayersByDateDesc(list)
        if (!cancelled) {
          setLayers(sorted)
          setLayer(pickLatestCmetLayer(sorted))
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load CMET layers')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [crop])

  const imageUrl = layer != null ? buildCmetExportImageUrl(crop, layer.id, 1200, 900) : null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">GEOGLAM crop conditions</h2>
          <p className="text-sm text-gray-500 mt-1">
            CMET MapServer — Horn of Africa view including Somalia (no API key)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CROP_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCrop(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize ${
                crop === key ? 'bg-[#05556c] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {layers.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time period layer</label>
          <select
            value={layer?.id ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value)
              setLayer(layers.find((l) => l.id === id) || null)
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
          >
            {layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        {CMET_LEGEND.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2 text-xs text-gray-600">
            <span className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {loading && <p className="text-gray-500 py-12 text-center">Loading crop condition layer…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {!loading && !error && imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SomaliaReferenceMap
            selectedRegion={highlightRegion}
            onRegionSelect={setHighlightRegion}
          />
          <div>
            <p className="text-sm font-medium text-gray-800 mb-2 capitalize">
              {crop} conditions — Horn of Africa (includes Somalia)
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Green = favourable · Yellow = watch · Orange/red = poor or failure. Compare with gobol names on the
              left.
            </p>
            <img src={imageUrl} alt={`${crop} crop conditions`} className="w-full rounded-lg border border-gray-200" />
          </div>
        </div>
      )}
    </div>
  )
}
