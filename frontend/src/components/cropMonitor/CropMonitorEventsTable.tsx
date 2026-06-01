import { useEffect, useMemo, useState } from 'react'
import { cropMonitorApi, type CropMonitorEvent } from '../../services/harvestInsights'

export default function CropMonitorEventsTable() {
  const [events, setEvents] = useState<CropMonitorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    cropMonitorApi
      .getEvents()
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) =>
        e.crop.toLowerCase().includes(q) ||
        e.driver.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.impact.toLowerCase().includes(q)
    )
  }, [events, search])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Crop Monitor events — Somalia</h2>
      <p className="text-sm text-gray-500 mb-4">GEOGLAM Crop Monitor Events API (public ArcGIS service)</p>

      <input
        type="search"
        placeholder="Filter by crop, driver, impact…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
      />

      {loading && <p className="text-gray-500 py-8 text-center">Loading events…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-500 py-8 text-center">No Crop Monitor events found for Somalia.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 font-semibold">Crop</th>
                <th className="px-3 py-2 font-semibold">Driver</th>
                <th className="px-3 py-2 font-semibold">Impact</th>
                <th className="px-3 py-2 font-semibold">Start</th>
                <th className="px-3 py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{e.crop}</td>
                  <td className="px-3 py-3">{e.driver}</td>
                  <td className="px-3 py-3">{e.impact}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{e.startDate || '—'}</td>
                  <td className="px-3 py-3 max-w-md">
                    {e.description}
                    {e.url && (
                      <>
                        {' '}
                        <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-[#05556c] underline">
                          Source
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
