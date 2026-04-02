import type { DroughtLevel, Region } from '../types'

/** Simplemaps state id (mapdata.js) → app region id */
export const SIMPLEMAP_CODE_TO_REGION_ID: Record<string, string> = {
  SOAW: 'awdal',
  SOBN: 'banadir',
  SOBY: 'bay',
  SOBK: 'bakool',
  SOHI: 'hiiraan',
  SOJD: 'middle-jubba',
  SOJH: 'lower-jubba',
  SOGE: 'gedo',
  SOSD: 'middle-shebelle',
  SOSH: 'lower-shebelle',
  SOGA: 'galgaduud',
  SOMU: 'mudug',
  SONU: 'nugaal',
  SOBR: 'bari',
  SOSA: 'sanaag',
  SOSO: 'sool',
  SOTO: 'togdheer',
  SOWO: 'woqooyi-galbeed',
}

const MAP_CONTAINER_ID = 'somalia-simplemap'

export function getSimplemapContainerId(): string {
  return MAP_CONTAINER_ID
}

function appendScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(s)
  })
}

let loadPromise: Promise<void> | null = null

/** Loads Simplemaps mapdata + countrymap once (from /public). */
export function loadSomaliaSimplemapsScripts(): Promise<void> {
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    await appendScript('/simplemaps-somalia/mapdata.js')
    const w = window as unknown as {
      simplemaps_countrymap_mapdata?: {
        main_settings: Record<string, unknown>
        state_specific: Record<string, { url?: string }>
      }
    }
    if (!w.simplemaps_countrymap_mapdata) return
    const md = w.simplemaps_countrymap_mapdata
    const m = md.main_settings
    m.div = MAP_CONTAINER_ID
    m.url_new_tab = 'no'
    m.auto_load = 'no'
    // Dark labels so names stay readable on yellow/orange/green region fills (library default is white)
    m.label_color = '#111827'
    m.label_hover_color = '#000000'
    m.label_line_color = '#111827'
    for (const key of Object.keys(md.state_specific)) {
      md.state_specific[key].url = ''
    }
    await appendScript('/simplemaps-somalia/countrymap.js')
  })()
  return loadPromise
}

export function getDroughtHex(level: DroughtLevel): string {
  switch (level) {
    case 'normal':
      return '#10b981'
    case 'watch':
      return '#fbbf24'
    case 'warning':
      return '#f97316'
    case 'emergency':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

function lightenHex(hex: string, amount = 0.25): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const to = (n: number) => n.toString(16).padStart(2, '0')
  return `#${to(mix(r))}${to(mix(g))}${to(mix(b))}`
}

type SimplemapsApi = {
  mapdata: {
    state_specific: Record<
      string,
      { color?: string; hover_color?: string; description?: string; url?: string }
    >
  }
  hooks: {
    click_state?: (id: string, ...args: unknown[]) => void
    ready?: () => void
  }
  refresh: () => void
  load: () => void
  loaded?: boolean
}

export function applyRegionsToSimplemap(
  regions: Region[],
  selectedRegion: string | null,
  droughtLabel: (level: DroughtLevel) => string
): void {
  const w = window as unknown as { simplemaps_countrymap?: SimplemapsApi }
  const api = w.simplemaps_countrymap
  if (!api?.mapdata?.state_specific) return

  const byId = new Map(regions.map((r) => [r.id, r]))

  for (const [code, regionId] of Object.entries(SIMPLEMAP_CODE_TO_REGION_ID)) {
    const region = byId.get(regionId)
    const st = api.mapdata.state_specific[code]
    if (!st) continue

    if (!region) {
      st.color = '#9ca3af'
      st.hover_color = '#d1d5db'
      st.description = '—'
      continue
    }

    const fill = getDroughtHex(region.droughtLevel)
    const isSel = selectedRegion === region.id
    st.color = fill
    st.hover_color = isSel ? lightenHex(fill, 0.35) : lightenHex(fill, 0.15)
    st.description = `${droughtLabel(region.droughtLevel)} · ${region.rainfallDeficit}% deficit`
  }

  if (typeof api.refresh === 'function') {
    api.refresh()
  }
}

export function attachSimplemapClickHandler(onSelect: (regionId: string) => void): void {
  const w = window as unknown as { simplemaps_countrymap?: SimplemapsApi }
  const api = w.simplemaps_countrymap
  if (!api?.hooks) return
  api.hooks.click_state = (id: string) => {
    const regionId = SIMPLEMAP_CODE_TO_REGION_ID[id]
    if (regionId) onSelect(regionId)
  }
}
