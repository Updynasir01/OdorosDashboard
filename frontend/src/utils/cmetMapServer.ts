/**
 * CMET (Crop Monitor Early Warning Tool) MapServer image export — no API key.
 * Layer list: https://data.cropmonitor.org/arcgis/rest/services/CMET/{Crop}/MapServer?f=pjson
 */

export const CMET_CROP_SERVICE: Record<string, string> = {
  maize: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Maize/MapServer',
  wheat: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Wheat/MapServer',
  rice: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Rice/MapServer',
  soybean: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Soybean/MapServer',
  sorghum: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Sorghum/MapServer',
  millet: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Millet/MapServer',
}

/** Horn of Africa extent — includes all of Somalia for CMET raster export. */
export const CMET_SOMALIA_VIEW_BBOX = {
  xmin: 40.5,
  ymin: -2,
  xmax: 51.5,
  ymax: 12,
} as const

export interface CmetLayerInfo {
  id: number
  name: string
}

interface MapServerPjson {
  layers?: Array<{ id: number; name: string }>
}

export async function fetchCmetLayerList(cropKey: keyof typeof CMET_CROP_SERVICE): Promise<CmetLayerInfo[]> {
  const base = CMET_CROP_SERVICE[cropKey]
  if (!base) return []
  const res = await fetch(`${base}?f=pjson`)
  if (!res.ok) throw new Error(`CMET MapServer: ${res.status}`)
  const data = (await res.json()) as MapServerPjson
  const layers = data.layers || []
  return layers
    .filter((l) => typeof l.id === 'number' && l.name)
    .map((l) => ({ id: l.id, name: l.name }))
}

function layerDateMs(name: string): number {
  const m = name.match(/_(\d{4})_(\d{2})_(\d{2})\.tif$/i)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : 0
}

export function sortCmetLayersByDateDesc(layers: CmetLayerInfo[]): CmetLayerInfo[] {
  return [...layers].sort((a, b) => layerDateMs(b.name) - layerDateMs(a.name))
}

/** Pick the chronologically latest layer by parsing `Crop_YYYY_MM_DD.tif` from the layer name. */
export function pickLatestCmetLayer(layers: CmetLayerInfo[]): CmetLayerInfo | null {
  const sorted = sortCmetLayersByDateDesc(layers)
  return sorted[0] ?? null
}

export function buildCmetExportImageUrl(
  cropKey: keyof typeof CMET_CROP_SERVICE,
  layerId: number,
  width: number,
  height: number
): string {
  const base = CMET_CROP_SERVICE[cropKey]
  const { xmin, ymin, xmax, ymax } = CMET_SOMALIA_VIEW_BBOX
  const params = new URLSearchParams({
    dpi: '96',
    transparent: 'true',
    format: 'png32',
    bbox: `${xmin},${ymin},${xmax},${ymax}`,
    bboxSR: '4326',
    size: `${Math.round(width)},${Math.round(height)}`,
    layers: `show:${layerId}`,
    f: 'image',
  })
  return `${base}/export?${params.toString()}`
}
