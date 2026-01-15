/**
 * FEWS NET (Famine Early Warning Systems Network) Data Service
 * 
 * Public data available at: https://fews.net/
 * Some data requires registration, but most is publicly available
 */

import axios from 'axios'

const FEWS_NET_BASE = 'https://fews.net/'

export interface FEWSData {
  date: string
  region: string
  foodSecurityPhase: string
  rainfall: number
  populationAffected: number
}

/**
 * Get FEWS NET data for Somalia
 * 
 * Note: FEWS NET often provides data as downloadable files
 * rather than REST APIs. You may need to:
 * 1. Download CSV/Excel files from their website
 * 2. Parse and import into MongoDB
 * 3. Or use their data portal API if available
 */
export async function getFEWSData(region?: string): Promise<FEWSData[]> {
  try {
    // FEWS NET data portal
    // Check: https://fews.net/fews-data/33 for Somalia-specific data
    
    // Example: If they have an API endpoint
    // const response = await axios.get(`${FEWS_NET_BASE}api/v1/data`, {
    //   params: {
    //     country: 'somalia',
    //     region: region,
    //   },
    // })
    
    console.log('Fetching FEWS NET data for Somalia')
    
    // For now, return placeholder
    // In production, you would:
    // 1. Download their CSV files
    // 2. Parse using csv-parser or similar
    // 3. Transform to your data format
    return []
  } catch (error) {
    console.error('Error fetching FEWS NET data:', error)
    throw error
  }
}

/**
 * Download and parse FEWS NET CSV files
 */
export async function parseFEWSCSV(fileUrl: string): Promise<FEWSData[]> {
  try {
    // Download CSV file
    // const response = await axios.get(fileUrl, { responseType: 'text' })
    // Parse CSV
    // const csv = require('csv-parser')
    // const results = []
    // 
    // response.data
    //   .pipe(csv())
    //   .on('data', (data) => results.push(data))
    //   .on('end', () => {
    //     return results
    //   })
    
    return []
  } catch (error) {
    console.error('Error parsing FEWS CSV:', error)
    throw error
  }
}

