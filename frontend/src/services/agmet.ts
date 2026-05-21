import axios from 'axios'

export type AgMetAdminTypeCode = 'adm1' | 'cm'

export interface AgMetCropSeasonYearItem {
  cropDisplayName: string
  seasonDisplayName: string
  yearDisplayName: string
  cropSeasonYearCode: string
}

export interface AgMetAdminUnitItem {
  displayName: string
  adminUnitCode: string
}

export interface AgMetAvailableGraphicItem {
  cropSeasonYearCode: string
  countryCode: string
  adminTypeCode: string
  adminUnitCode: string
  url: string
}

const AGMET_API_BASE = 'https://agmet.cropmonitortools.org/api'

function getYearFromCode(code: string): number {
  const m = code.match(/_(\d{4})$/)
  if (!m) return -1
  return Number(m[1])
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
}

export const agmetService = {
  async getCropSeasonYearCodes(countryCode: string, adminTypeCode: AgMetAdminTypeCode): Promise<AgMetCropSeasonYearItem[]> {
    const res = await axios.get(`${AGMET_API_BASE}/GetCropSeasonYearCodes`, {
      params: { countryCode, adminTypeCode },
      timeout: 20000,
    })
    return res.data
  },

  async getSubnationalAdminUnitCodes(
    countryCode: string,
    adminTypeCode: AgMetAdminTypeCode,
    cropSeasonYearCode: string
  ): Promise<AgMetAdminUnitItem[]> {
    const res = await axios.get(`${AGMET_API_BASE}/GetSubnationalAdminUnitCodes`, {
      params: { countryCode, adminTypeCode, cropSeasonYearCode },
      timeout: 20000,
    })
    return res.data
  },

  async getAvailableAgMetGraphics(filters: {
    countryCode?: string
    cropCode?: string
    seasonCode?: string
    year?: number
    adminTypeCode?: AgMetAdminTypeCode
    adminUnitCode?: string
  }): Promise<AgMetAvailableGraphicItem[]> {
    const res = await axios.get(`${AGMET_API_BASE}/GetAvailableAgMetGraphics`, {
      params: {
        ...filters,
        year: filters.year ? String(filters.year) : undefined,
      },
      timeout: 30000,
    })
    return res.data
  },

  /** Returns latest `mz_s1_YYYY` or `mz_s2_YYYY` for the requested season. */
  pickLatestMaizeCropSeasonYearCode(items: AgMetCropSeasonYearItem[], season: 's1' | 's2'): string | null {
    const filtered = items.filter((i) => i.cropSeasonYearCode.startsWith(`mz_${season}_`))
    if (filtered.length === 0) return null
    const sorted = [...filtered].sort((a, b) => getYearFromCode(b.cropSeasonYearCode) - getYearFromCode(a.cropSeasonYearCode))
    return sorted[0]?.cropSeasonYearCode || null
  },

  findAdminUnitByName(adminUnits: AgMetAdminUnitItem[], regionName: string): AgMetAdminUnitItem | null {
    const target = normalizeName(regionName)
    const direct = adminUnits.find((u) => normalizeName(u.displayName) === target)
    if (direct) return direct

    const aliases: Record<string, string[]> = {
      'middle jubba': ['juba dhexe'],
      'lower jubba': ['juba hoose'],
      'middle shebelle': ['shabelle dhexe'],
      'lower shebelle': ['shabelle hoose'],
      'woqooyi galbeed': ['woqooyi galbeed'],
    }

    for (const [k, vals] of Object.entries(aliases)) {
      if (target === k) {
        for (const v of vals) {
          const hit = adminUnits.find((u) => normalizeName(u.displayName) === v)
          if (hit) return hit
        }
      }
    }

    const contains = adminUnits.find((u) => normalizeName(u.displayName).includes(target) || target.includes(normalizeName(u.displayName)))
    return contains || null
  },
}

