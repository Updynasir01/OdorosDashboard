import axios from 'axios'

/**
 * Confirms NASA Earthdata Login bearer token works against CMR (optional but recommended).
 */
export async function nasaEarthdataTokenIsValid(): Promise<boolean> {
  const token = process.env.NASA_BEARER_TOKEN?.trim()
  if (!token) return false

  try {
    const res = await axios.get('https://cmr.earthdata.nasa.gov/search/collections.json', {
      params: { short_name: 'MOD13Q1', page_size: 1 },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000,
      validateStatus: (s) => s === 200 || s === 401,
    })
    if (res.status === 401) return false
    return Array.isArray(res.data?.feed?.entry)
  } catch {
    return false
  }
}
