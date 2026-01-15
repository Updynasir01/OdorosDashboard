/**
 * UN OCHA Humanitarian Data Exchange (HDX) Service
 * 
 * Free and open humanitarian data
 * API: https://data.humdata.org/api
 * No API key required for public data!
 */

import axios from 'axios'

const HDX_API_BASE = 'https://data.humdata.org/api/3/action/'

export interface HDXDataset {
  id: string
  title: string
  organization: string
  resources: Array<{
    url: string
    format: string
    name: string
  }>
}

/**
 * Search HDX for Somalia datasets
 */
export async function searchHDXDatasets(query: string = 'somalia'): Promise<HDXDataset[]> {
  try {
    const response = await axios.get(`${HDX_API_BASE}package_search`, {
      params: {
        q: query,
        rows: 100, // Max results
      },
    })

    if (response.data.success) {
      return response.data.result.results.map((pkg: any) => ({
        id: pkg.id,
        title: pkg.title,
        organization: pkg.organization?.title || 'Unknown',
        resources: pkg.resources.map((res: any) => ({
          url: res.url,
          format: res.format,
          name: res.name,
        })),
      }))
    }

    return []
  } catch (error) {
    console.error('Error searching HDX:', error)
    throw error
  }
}

/**
 * Get specific dataset from HDX
 */
export async function getHDXDataset(datasetId: string): Promise<any> {
  try {
    const response = await axios.get(`${HDX_API_BASE}package_show`, {
      params: {
        id: datasetId,
      },
    })

    if (response.data.success) {
      return response.data.result
    }

    return null
  } catch (error) {
    console.error('Error fetching HDX dataset:', error)
    throw error
  }
}

/**
 * Download and process HDX resource (CSV, JSON, etc.)
 */
export async function downloadHDXResource(resourceUrl: string): Promise<any> {
  try {
    const response = await axios.get(resourceUrl)
    return response.data
  } catch (error) {
    console.error('Error downloading HDX resource:', error)
    throw error
  }
}

/**
 * Find relevant Somalia datasets for drought monitoring
 */
export async function findSomaliaDroughtDatasets(): Promise<HDXDataset[]> {
  const queries = [
    'somalia drought',
    'somalia rainfall',
    'somalia water',
    'somalia idp',
    'somalia population',
    'somalia food security',
  ]

  const allDatasets: HDXDataset[] = []

  for (const query of queries) {
    try {
      const datasets = await searchHDXDatasets(query)
      allDatasets.push(...datasets)
    } catch (error) {
      console.error(`Error searching for "${query}":`, error)
    }
  }

  // Remove duplicates
  const uniqueDatasets = Array.from(
    new Map(allDatasets.map((d) => [d.id, d])).values()
  )

  return uniqueDatasets
}

