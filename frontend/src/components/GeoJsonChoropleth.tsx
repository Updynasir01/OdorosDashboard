import { useMemo } from 'react'
import type { GeoJsonFeatureCollection } from '../services/harvestInsights'

const SOMALIA_BBOX = { minLon: 41, maxLon: 52, minLat: -2, maxLat: 12 }

function ringToPath(ring: number[][], width: number, height: number): string {
  return (
    ring
      .map(([lon, lat], i) => {
        const x = ((lon - SOMALIA_BBOX.minLon) / (SOMALIA_BBOX.maxLon - SOMALIA_BBOX.minLon)) * width
        const y = ((SOMALIA_BBOX.maxLat - lat) / (SOMALIA_BBOX.maxLat - SOMALIA_BBOX.minLat)) * height
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ') + ' Z'
  )
}

function geometryToPaths(geometry: { type: string; coordinates: unknown }, width: number, height: number): string[] {
  if (!geometry?.coordinates) return []
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as number[][][]
    return rings.length ? [ringToPath(rings[0], width, height)] : []
  }
  if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates as number[][][][]
    return polys.flatMap((poly) => (poly[0] ? [ringToPath(poly[0], width, height)] : []))
  }
  return []
}

interface GeoJsonChoroplethProps {
  geojson: GeoJsonFeatureCollection
  colorForFeature: (props: Record<string, unknown>) => string
  width?: number
  height?: number
}

export default function GeoJsonChoropleth({
  geojson,
  colorForFeature,
  width = 520,
  height = 620,
}: GeoJsonChoroplethProps) {
  const shapes = useMemo(
    () =>
      geojson.features.map((feature, idx) => ({
        key: idx,
        paths: geometryToPaths(feature.geometry, width, height),
        fill: colorForFeature(feature.properties),
        name: String(
          feature.properties.geographic_unit_name ||
            feature.properties.name ||
            feature.properties.admin1Name ||
            `Unit ${idx + 1}`
        ),
        value: feature.properties.value,
      })),
    [geojson, width, height, colorForFeature]
  )

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-sky-50 rounded-lg border border-gray-200">
      {shapes.flatMap((shape) =>
        shape.paths.map((d, i) => (
          <path
            key={`${shape.key}-${i}`}
            d={d}
            fill={shape.fill}
            stroke="#ffffff"
            strokeWidth={0.8}
            opacity={0.92}
          >
            <title>
              {shape.name}
              {shape.value != null ? ` — IPC ${shape.value}` : ''}
            </title>
          </path>
        ))
      )}
    </svg>
  )
}
