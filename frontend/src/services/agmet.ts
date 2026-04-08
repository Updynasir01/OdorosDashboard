import axios from 'axios'

export type AgMetAdminTypeCode = 'adm1' | 'cm'

export interface AgMetAdminType {
  adminName: string
  adminType: AgMetAdminTypeCode
}

export interface AgMetCountryItem {
  countryName: string
  countryCode: string
}

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

export interface AgMetGraphicResponse {
  url: string | null
  error: string | null
}

export interface AgMetAvailableGraphicItem {
  cropSeasonYearCode: string
  countryCode: string
  adminTypeCode: string
  adminUnitCode: string
  url: string
}

const AGMET_API_BASE = 'https://agmet.cropmonitortools.org/api'

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getYearFromCode(code: string): number {
  const m = code.match(/_(\d{4})$/)
  if (!m) return -1
  return Number(m[1])
}

export const agmetService = {
  async getAdminTypeCodes(): Promise<AgMetAdminType[]> {
    const res = await axios.get(`${AGMET_API_BASE}/GetAdminTypeCodes`, { timeout: 15000 })
    return res.data
  },

  async getCountryCodes(adminType: AgMetAdminTypeCode): Promise<AgMetCountryItem[]> {
    const res = await axios.get(`${AGMET_API_BASE}/GetCountryCodes`, {
      params: { adminType },
      timeout: 15000,
    })
    return res.data
  },

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

  async getAgMetGraphic(params: {
    countryCode: string
    adminTypeCode: AgMetAdminTypeCode
    cropSeasonYearCode: string
    adminUnitCode: string
  }): Promise<AgMetGraphicResponse> {
    const res = await axios.get(`${AGMET_API_BASE}/GetAgMetGraphic`, {
      params: {
        countryCode: params.countryCode,
        adminTypeCode: params.adminTypeCode,
        cropSeasonYearCode: params.cropSeasonYearCode,
        adminUnitCode: params.adminUnitCode,
      },
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

  pickLatestMaizeSeasonCode(items: AgMetCropSeasonYearItem[]): string | null {
    const maize = items.filter((i) => i.cropSeasonYearCode.startsWith('mz_'))
    if (maize.length === 0) return null
    const sorted = [...maize].sort((a, b) => getYearFromCode(b.cropSeasonYearCode) - getYearFromCode(a.cropSeasonYearCode))
    return sorted[0]?.cropSeasonYearCode || null
  },

  findAdminUnitByRegionName(adminUnits: AgMetAdminUnitItem[], regionName: string): AgMetAdminUnitItem | null {
    const target = normalizeName(regionName)
    const direct = adminUnits.find((u) => normalizeName(u.displayName) === target)
    if (direct) return direct

    // Some Somalia names differ slightly across sources.
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

    // Fallback: contains match
    const contains = adminUnits.find((u) => normalizeName(u.displayName).includes(target) || target.includes(normalizeName(u.displayName)))
    return contains || null
  },
}

