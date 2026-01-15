/**
 * Main Data Ingestion Service
 * 
 * Orchestrates data fetching from all sources and stores in MongoDB
 */

import Region from '../../models/Region'
import TimeSeries from '../../models/TimeSeries'
import Alert from '../../models/Alert'
import Impact from '../../models/Impact'
import JobRun from '../../models/JobRun'
import { getCHIRPSData, calculateRainfallAnomaly } from './chirpsService'
import { getMODISNDVI } from './nasaService'
import { getFEWSData } from './fewsNetService'
import { findSomaliaDroughtDatasets, downloadHDXResource } from './hdxService'

/**
 * Main function to ingest all data sources
 */
export async function ingestAllData() {
  const jobRun = new JobRun({
    jobType: 'data-ingestion',
    status: 'running',
    startedAt: new Date(),
  })
  await jobRun.save()

  console.log('🚀 Starting data ingestion from all sources...')

  try {
    let totalRecords = 0

    // 1. Ingest CHIRPS rainfall data
    console.log('📊 Fetching CHIRPS rainfall data...')
    const chirpsRecords = await ingestCHIRPSData()
    totalRecords += chirpsRecords

    // 2. Ingest NASA MODIS NDVI data
    console.log('🌱 Fetching NASA MODIS NDVI data...')
    const ndviRecords = await ingestNDVIData()
    totalRecords += ndviRecords

    // 3. Ingest FEWS NET data
    console.log('🍽️ Fetching FEWS NET data...')
    const fewsRecords = await ingestFEWSData()
    totalRecords += fewsRecords

    // 4. Ingest HDX humanitarian data
    console.log('👥 Fetching HDX humanitarian data...')
    const hdxRecords = await ingestHDXData()
    totalRecords += hdxRecords

    // Update job status
    jobRun.status = 'completed'
    jobRun.completedAt = new Date()
    jobRun.recordsProcessed = totalRecords
    await jobRun.save()

    console.log('✅ Data ingestion completed!')
    return { success: true, recordsProcessed: totalRecords }
  } catch (error: any) {
    console.error('❌ Error during data ingestion:', error)
    
    jobRun.status = 'failed'
    jobRun.completedAt = new Date()
    jobRun.error = error.message
    await jobRun.save()

    throw error
  }
}

/**
 * Ingest CHIRPS rainfall data
 */
async function ingestCHIRPSData(): Promise<number> {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)
    const startDateStr = startDate.toISOString().split('T')[0]

    const regions = await Region.find()
    let recordsProcessed = 0
    
    for (const region of regions) {
      const chirpsData = await getCHIRPSData(startDateStr, endDate, region.id)
      
      if (chirpsData.length > 0) {
        const latestData = chirpsData[chirpsData.length - 1]
        
        // Calculate historical average from existing time series data
        const historicalData = await TimeSeries.find({
          regionId: region.id,
          rainfall: { $exists: true, $ne: null },
        })
          .sort({ date: -1 })
          .limit(90) // Last 90 days
        
        const historicalAvg = historicalData.length > 0
          ? historicalData.reduce((sum, d) => sum + (d.rainfall || 0), 0) / historicalData.length
          : 25.0 // Default fallback
        
        const anomaly = calculateRainfallAnomaly(latestData.precipitation, historicalAvg)
        
        // Update region
        await Region.updateOne(
          { id: region.id },
          {
            $set: {
              rainfallDeficit: Math.abs(anomaly),
              lastRainfallDate: new Date(latestData.date),
            },
          }
        )
        
        // Store time series data
        for (const data of chirpsData) {
          await TimeSeries.updateOne(
            { regionId: region.id, date: new Date(data.date) },
            {
              $set: {
                rainfall: data.precipitation,
              },
            },
            { upsert: true }
          )
          recordsProcessed++
        }
      }
    }
    
    return recordsProcessed
  } catch (error) {
    console.error('Error ingesting CHIRPS data:', error)
    return 0
  }
}

/**
 * Ingest NASA MODIS NDVI data
 */
async function ingestNDVIData(): Promise<number> {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)
    const startDateStr = startDate.toISOString().split('T')[0]

    const regions = await Region.find()
    let recordsProcessed = 0
    
    for (const region of regions) {
      const ndviData = await getMODISNDVI(startDateStr, endDate, region.id)
      
      if (ndviData.length > 0) {
        const latestNDVI = ndviData[ndviData.length - 1]
        
        // Update region NDVI
        await Region.updateOne(
          { id: region.id },
          {
            $set: {
              ndvi: latestNDVI.ndvi,
            },
          }
        )
        
        // Update time series
        for (const data of ndviData) {
          await TimeSeries.updateOne(
            { regionId: region.id, date: new Date(data.date) },
            {
              $set: {
                ndvi: data.ndvi,
              },
            },
            { upsert: true }
          )
          recordsProcessed++
        }
      }
    }
    
    return recordsProcessed
  } catch (error) {
    console.error('Error ingesting NDVI data:', error)
    return 0
  }
}

/**
 * Ingest FEWS NET data
 */
async function ingestFEWSData(): Promise<number> {
  try {
    const fewsData = await getFEWSData()
    let recordsProcessed = 0
    
    for (const data of fewsData) {
      await Impact.updateOne(
        { regionId: data.region, date: new Date(data.date) },
        {
          $set: {
            region: data.region,
            populationAffected: data.populationAffected,
            foodInsecurityPhase: data.foodSecurityPhase,
          },
        },
        { upsert: true }
      )
      recordsProcessed++
    }
    
    return recordsProcessed
  } catch (error) {
    console.error('Error ingesting FEWS NET data:', error)
    return 0
  }
}

/**
 * Ingest HDX humanitarian data
 */
async function ingestHDXData(): Promise<number> {
  try {
    const datasets = await findSomaliaDroughtDatasets()
    
    console.log(`Found ${datasets.length} relevant HDX datasets`)
    
    let recordsProcessed = 0
    
    // Process each dataset
    for (const dataset of datasets.slice(0, 10)) { // Limit to first 10
      console.log(`Processing dataset: ${dataset.title}`)
      
      // Download and process resources
      for (const resource of dataset.resources) {
        if (resource.format === 'CSV' || resource.format === 'JSON') {
          try {
            const data = await downloadHDXResource(resource.url)
            // Process and store data based on content
            // This would need custom logic per dataset type
            console.log(`Downloaded ${resource.name}`)
            recordsProcessed++
          } catch (error) {
            console.error(`Error downloading ${resource.name}:`, error)
          }
        }
      }
    }
    
    return recordsProcessed
  } catch (error) {
    console.error('Error ingesting HDX data:', error)
    return 0
  }
}
