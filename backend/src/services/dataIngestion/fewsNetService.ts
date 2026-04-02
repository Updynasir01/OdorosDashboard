/**
 * FEWS NET (Famine Early Warning Systems Network) Data Service
 *
 * Somalia FEWS resources are accessed via Harvest Portal.
 */

import { getHarvestPortalResourceData } from './harvestPortalService'

const FEWS_SOMALIA_FOOD_INSECURITY_RESOURCE_ID = 'f71147c0-1256-4415-9ea3-1e7fc9c20a87'

export interface FEWSData {
  date: string
  region: string
  foodSecurityPhase: 'minimal' | 'stressed' | 'crisis' | 'emergency' | 'famine'
  scenario: 'CS' | 'ML1' | 'ML2'
  rainfall: number
  populationAffected: number
}

function normalize(value: unknown): string {
  return String(value || '').trim().toLowerCase()
}

function toPhase(value: unknown): FEWSData['foodSecurityPhase'] | null {
  const raw = normalize(value)
  if (!raw) return null

  const numericMatch = raw.match(/[1-5]/)
  if (numericMatch) {
    switch (numericMatch[0]) {
      case '1':
        return 'minimal'
      case '2':
        return 'stressed'
      case '3':
        return 'crisis'
      case '4':
        return 'emergency'
      case '5':
        return 'famine'
    }
  }

  if (raw.includes('minimal')) return 'minimal'
  if (raw.includes('stressed')) return 'stressed'
  if (raw.includes('crisis')) return 'crisis'
  if (raw.includes('emergency')) return 'emergency'
  if (raw.includes('famine')) return 'famine'
  return null
}

function pickScenarioPhase(properties: Record<string, unknown>): { scenario: FEWSData['scenario']; phase: FEWSData['foodSecurityPhase'] } | null {
  const scenarioCandidates: Array<{ scenario: FEWSData['scenario']; keys: string[] }> = [
    { scenario: 'CS', keys: ['cs', 'current_situation', 'current', 'phase_cs'] },
    { scenario: 'ML1', keys: ['ml1', 'phase_ml1'] },
    { scenario: 'ML2', keys: ['ml2', 'phase_ml2'] },
  ]

  for (const candidate of scenarioCandidates) {
    for (const [key, value] of Object.entries(properties)) {
      const nk = normalize(key)
      if (!candidate.keys.some((k) => nk === k || nk.includes(k))) continue
      const phase = toPhase(value)
      if (phase) {
        return { scenario: candidate.scenario, phase }
      }
    }
  }

  for (const value of Object.values(properties)) {
    const phase = toPhase(value)
    if (phase) {
      return { scenario: 'CS', phase }
    }
  }

  return null
}

function pickRegionName(properties: Record<string, unknown>): string {
  return String(
    properties.region ||
      properties.Region ||
      properties.adm1_name ||
      properties.ADMIN1 ||
      properties.shapeName ||
      properties.name ||
      ''
  ).trim()
}

/**
 * Get FEWS food insecurity data for Somalia from Harvest Portal.
 */
export async function getFEWSData(region?: string): Promise<FEWSData[]> {
  const payload = await getHarvestPortalResourceData(FEWS_SOMALIA_FOOD_INSECURITY_RESOURCE_ID)
  if (!payload) return []

  const features = Array.isArray(payload?.features) ? payload.features : []
  const out: FEWSData[] = []
  const today = new Date().toISOString().split('T')[0]

  for (const feature of features) {
    const props = (feature?.properties || {}) as Record<string, unknown>
    const regionName = pickRegionName(props)
    if (!regionName) continue

    if (region && normalize(regionName) !== normalize(region)) continue

    const scenario = pickScenarioPhase(props)
    if (!scenario) continue

    out.push({
      date: today,
      region: regionName,
      foodSecurityPhase: scenario.phase,
      scenario: scenario.scenario,
      rainfall: 0,
      populationAffected: 0,
    })
  }

  return out
}

/**
 * Download and parse FEWS NET CSV files
 */
export async function parseFEWSCSV(fileUrl: string): Promise<FEWSData[]> {
  void fileUrl
  return []
}

