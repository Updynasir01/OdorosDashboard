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

const REGION_ID_TO_SIMPLEMAP_CODE: Record<string, string> = Object.entries(SIMPLEMAP_CODE_TO_REGION_ID).reduce(
  (acc, [code, regionId]) => {
    acc[regionId] = code
    return acc
  },
  {} as Record<string, string>
)

const MAP_CONTAINER_ID = 'somalia-simplemap'
export const REFERENCE_MAP_CONTAINER_ID = 'somalia-reference-map'

const GOBOL_DISPLAY_NAMES: Record<string, string> = {
  awdal: 'Awdal',
  banadir: 'Banadir',
  bay: 'Bay',
  bakool: 'Bakool',
  hiiraan: 'Hiiraan',
  'middle-jubba': 'Middle Jubba',
  'lower-jubba': 'Lower Jubba',
  gedo: 'Gedo',
  'middle-shebelle': 'Middle Shebelle',
  'lower-shebelle': 'Lower Shebelle',
  galgaduud: 'Galgaduud',
  mudug: 'Mudug',
  nugaal: 'Nugaal',
  bari: 'Bari',
  sanaag: 'Sanaag',
  sool: 'Sool',
  togdheer: 'Togdheer',
  'woqooyi-galbeed': 'Woqooyi Galbeed',
}

const MAP_LABEL_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

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

let scriptsPromise: Promise<void> | null = null

function configureSimplemapContainer(containerId: string): void {
  const w = window as unknown as {
    simplemaps_countrymap_mapdata?: {
      main_settings: Record<string, unknown>
      state_specific: Record<string, { url?: string }>
    }
  }
  if (!w.simplemaps_countrymap_mapdata) return
  const md = w.simplemaps_countrymap_mapdata
  const m = md.main_settings
  m.div = containerId
  m.url_new_tab = 'no'
  m.auto_load = 'no'
  m.all_states_zoomable = 'yes'
  m.all_locations_hidden = 'yes'
  m.label_color = '#111827'
  m.label_hover_color = '#000000'
  m.label_line_color = 'transparent'
  m.label_size = 14
  m.label_font = MAP_LABEL_FONT
  for (const key of Object.keys(md.state_specific)) {
    md.state_specific[key].url = ''
  }
}

/** Loads Simplemaps scripts once, then targets the given container div. */
export function loadSomaliaSimplemapsScripts(containerId: string = MAP_CONTAINER_ID): Promise<void> {
  if (!scriptsPromise) {
    scriptsPromise = (async () => {
      await appendScript('/simplemaps-somalia/mapdata.js')
      await appendScript('/simplemaps-somalia/countrymap.js')
    })()
  }
  return scriptsPromise.then(() => {
    configureSimplemapContainer(containerId)
  })
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

/** Crisp, readable SVG labels after Simplemaps paints the map. */
export function polishSimplemapLabels(containerId: string = MAP_CONTAINER_ID): void {
  const root = document.getElementById(containerId)
  if (!root) return

  root.querySelectorAll('svg text').forEach((node) => {
    const el = node as SVGTextElement
    el.setAttribute('font-family', MAP_LABEL_FONT)
    el.setAttribute('font-weight', '600')
    el.setAttribute('letter-spacing', '0.02em')
    el.setAttribute('text-rendering', 'geometricPrecision')
    el.setAttribute('paint-order', 'stroke fill')
    el.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)')
    el.setAttribute('stroke-width', '2.5')
    el.setAttribute('stroke-linejoin', 'round')
    el.setAttribute('fill', '#111827')
    el.setAttribute('text-anchor', 'middle')
    el.setAttribute('dominant-baseline', 'central')
  })
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

  requestAnimationFrame(() => polishSimplemapLabels(MAP_CONTAINER_ID))
}

/** Neutral gobol outline map for reference panels (e.g. Crop Monitor). */
export function applyNeutralReferenceMap(containerId: string = REFERENCE_MAP_CONTAINER_ID): void {
  const w = window as unknown as { simplemaps_countrymap?: SimplemapsApi }
  const api = w.simplemaps_countrymap
  if (!api?.mapdata?.state_specific) return

  for (const [code, regionId] of Object.entries(SIMPLEMAP_CODE_TO_REGION_ID)) {
    const st = api.mapdata.state_specific[code]
    if (!st) continue
    st.color = '#e0f2f1'
    st.hover_color = '#b2dfdb'
    st.description = GOBOL_DISPLAY_NAMES[regionId] || regionId.replace(/-/g, ' ')
  }

  if (typeof api.refresh === 'function') {
    api.refresh()
  }

  requestAnimationFrame(() => polishSimplemapLabels(containerId))
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

function getMapSvg(containerId: string = MAP_CONTAINER_ID): SVGSVGElement | null {
  const root = document.getElementById(containerId)
  if (!root) return null
  return root.querySelector('svg')
}

function ensureOriginalViewBox(svg: SVGSVGElement): string {
  const existing = svg.getAttribute('data-original-viewBox')
  if (existing) return existing
  const vb = svg.getAttribute('viewBox')
  // If no viewBox is set, create one from the current bounds.
  const initial =
    vb ||
    (() => {
      const r = svg.getBoundingClientRect()
      return `0 0 ${Math.max(1, Math.round(r.width))} ${Math.max(1, Math.round(r.height))}`
    })()
  svg.setAttribute('data-original-viewBox', initial)
  if (!vb) svg.setAttribute('viewBox', initial)
  return initial
}

export function zoomSimplemapToRegion(regionId: string | null, containerId: string = MAP_CONTAINER_ID): void {
  const svg = getMapSvg(containerId)
  if (!svg) return
  const original = ensureOriginalViewBox(svg)

  if (!regionId) {
    svg.setAttribute('viewBox', original)
    return
  }

  const code = REGION_ID_TO_SIMPLEMAP_CODE[regionId]
  if (!code) return

  // Simplemaps states are usually <path id="SOAW"> or wrapped groups with that id.
  const target = (svg.querySelector(`#${CSS.escape(code)}`) as SVGGraphicsElement | null) ||
    (svg.querySelector(`[id="${code}"]`) as SVGGraphicsElement | null)
  if (!target || typeof (target as any).getBBox !== 'function') return

  const box = target.getBBox()
  if (!Number.isFinite(box.x) || !Number.isFinite(box.y) || !Number.isFinite(box.width) || !Number.isFinite(box.height)) return

  // Pad a bit so the region isn't flush to edges.
  const padX = box.width * 0.35
  const padY = box.height * 0.35
  const x = Math.max(0, box.x - padX)
  const y = Math.max(0, box.y - padY)
  const w = box.width + padX * 2
  const h = box.height + padY * 2

  svg.setAttribute('viewBox', `${x} ${y} ${Math.max(1, w)} ${Math.max(1, h)}`)
}
