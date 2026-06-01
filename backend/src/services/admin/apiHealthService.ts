import axios from 'axios'

export interface ApiHealthResult {
  name: string
  online: boolean
  latencyMs: number | null
  detail?: string
}

async function ping(
  name: string,
  fn: () => Promise<void>
): Promise<ApiHealthResult> {
  const start = Date.now()
  try {
    await fn()
    return { name, online: true, latencyMs: Date.now() - start }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed'
    return { name, online: false, latencyMs: null, detail: message }
  }
}

export async function checkExternalApis(): Promise<ApiHealthResult[]> {
  const harvestKey = process.env.HARVEST_PORTAL_API_KEY?.trim()

  return Promise.all([
    ping('NASA POWER', async () => {
      await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
        params: {
          parameters: 'PRECTOTCORR',
          community: 'AG',
          longitude: 45.3182,
          latitude: 2.0469,
          start: '20240101',
          end: '20240107',
          format: 'JSON',
        },
        timeout: 15000,
      })
    }),
    ping('NASA GLAM', async () => {
      await axios.get('https://api.glamdata.org/boundary-features/geoboundaries-som-adm1/', {
        timeout: 15000,
      })
    }),
    ping('GEOGLAM', async () => {
      await axios.get('https://api.glamdata.org/boundary-features/geoboundaries-som-adm1/', {
        timeout: 15000,
        validateStatus: (s) => s < 500,
      })
    }),
    ping('Harvest Portal', async () => {
      await axios.get('https://data.harvestportal.org/api/action/package_search', {
        params: { q: 'somalia', rows: 1 },
        headers: harvestKey ? { Authorization: harvestKey } : {},
        timeout: 15000,
      })
    }),
  ])
}
