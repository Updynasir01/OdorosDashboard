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
import { getSomaliaAdm1FeaturesFromHarvest, hasHarvestPortalKey } from './harvestPortalService'
import {
  getGlamAdm1FeatureMap,
  mapRegionFeaturesToGlamFeatureIds,
  queryGlamValueByGeometry,
  GlamProductId,
} from './glamService'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

async function fetchRegionalGlamSnapshot(
  productId: GlamProductId,
  date: string
): Promise<Map<string, number>> {
  if (!hasHarvestPortalKey()) {
    return new Map()
  }

  const features = await getSomaliaAdm1FeaturesFromHarvest()
  if (features.length === 0) {
    return new Map()
  }

  const glamFeatureMap = await getGlamAdm1FeatureMap()
  const mappedFeatures = mapRegionFeaturesToGlamFeatureIds(features, glamFeatureMap)

  const out = new Map<string, number>()
  for (const feature of mappedFeatures) {
    const value = await queryGlamValueByGeometry(productId, date, feature.geometry)
    if (value === null) continue
    out.set(normalizeName(feature.regionName), value)
  }

  return out
}

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

    // 2b. Ingest water scarcity + livestock risk from GLAM (when available)
    console.log('💧🐄 Fetching GLAM SWI/ESI data...')
    const glamImpactRecords = await ingestWaterAndLivestockFromGlam()
    totalRecords += glamImpactRecords

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
    const glamPrecipByRegion = await fetchRegionalGlamSnapshot('chirps-precip', endDate)
    
    for (const region of regions) {
      const glamRainfall = glamPrecipByRegion.get(normalizeName(region.name))
      if (typeof glamRainfall === 'number' && Number.isFinite(glamRainfall)) {
        const historicalData = await TimeSeries.find({
          regionId: region.id,
          rainfall: { $exists: true, $ne: null },
        })
          .sort({ date: -1 })
          .limit(90)

        const historicalAvg = historicalData.length > 0
          ? historicalData.reduce((sum, d) => sum + (d.rainfall || 0), 0) / historicalData.length
          : 25.0

        const anomaly = calculateRainfallAnomaly(glamRainfall, historicalAvg)

        await Region.updateOne(
          { id: region.id },
          {
            $set: {
              rainfallDeficit: Math.abs(anomaly),
              lastRainfallDate: new Date(endDate),
            },
          }
        )

        await TimeSeries.updateOne(
          { regionId: region.id, date: new Date(endDate) },
          { $set: { rainfall: glamRainfall } },
          { upsert: true }
        )

        recordsProcessed++
        continue
      }

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
    const glamNdviByRegion = await fetchRegionalGlamSnapshot('mod13q1-ndvi', endDate)
    
    for (const region of regions) {
      const glamNdviRaw = glamNdviByRegion.get(normalizeName(region.name))
      if (typeof glamNdviRaw === 'number' && Number.isFinite(glamNdviRaw)) {
        // GLAM/MODIS values are often scaled by 10000.
        const ndvi = glamNdviRaw > 1 ? glamNdviRaw / 10000 : glamNdviRaw
        const normalizedNdvi = clamp(ndvi, 0, 1)

        await Region.updateOne(
          { id: region.id },
          {
            $set: {
              ndvi: normalizedNdvi,
            },
          }
        )

        await TimeSeries.updateOne(
          { regionId: region.id, date: new Date(endDate) },
          {
            $set: {
              ndvi: normalizedNdvi,
            },
          },
          { upsert: true }
        )

        recordsProcessed++
        continue
      }

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
 * Ingest water scarcity + livestock risk using GLAM SWI and SERVIR ESI.
 */
async function ingestWaterAndLivestockFromGlam(): Promise<number> {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const regions = await Region.find()
    let recordsProcessed = 0

    const swiByRegion = await fetchRegionalGlamSnapshot('copernicus-swi', endDate)
    const esiByRegion = await fetchRegionalGlamSnapshot('servir-4wk-esi', endDate)

    for (const region of regions) {
      const swi = swiByRegion.get(normalizeName(region.name))
      const esi = esiByRegion.get(normalizeName(region.name))

      const updates: Record<string, number> = {}

      if (typeof swi === 'number' && Number.isFinite(swi)) {
        // If SWI is 0..200, normalize to 0..100 first, then invert to scarcity.
        const swiPercent = swi > 100 ? swi / 2 : swi
        updates.waterScarcity = clamp(100 - swiPercent, 0, 100)
      }

      if (typeof esi === 'number' && Number.isFinite(esi)) {
        // ESI usually ranges around -3.5..+3.5 (negative = stress).
        const normalized = clamp((esi + 3.5) / 7, 0, 1)
        updates.livestockRisk = clamp((1 - normalized) * 100, 0, 100)
      }

      if (Object.keys(updates).length === 0) continue

      await Region.updateOne(
        { id: region.id },
        { $set: updates }
      )
      recordsProcessed++
    }

    return recordsProcessed
  } catch (error) {
    console.error('Error ingesting GLAM SWI/ESI data:', error)
    return 0
  }
}

/**
 * Ingest FEWS NET data
 */
async function ingestFEWSData(): Promise<number> {
  try {
    const fewsData = await getFEWSData()
    const regions = await Region.find().lean()
    let recordsProcessed = 0

    const regionIdByName = new Map<string, { id: string; name: string }>()
    for (const region of regions) {
      regionIdByName.set(normalizeName(region.name), { id: region.id, name: region.name })
      regionIdByName.set(normalizeName(region.id), { id: region.id, name: region.name })
    }

    const aliases: Record<string, string> = {
      hiran: 'hiiraan',
      hiiran: 'hiiraan',
      'middle shabelle': 'middle-shebelle',
      'lower shabelle': 'lower-shebelle',
      'middle juba': 'middle-jubba',
      'lower juba': 'lower-jubba',
      northwest: 'woqooyi-galbeed',
    }

    const resolveRegion = (fewsRegion: string) => {
      const n = normalizeName(fewsRegion)
      const direct = regionIdByName.get(n)
      if (direct) return direct
      const aliasKey = aliases[n]
      if (!aliasKey) return null
      return regionIdByName.get(normalizeName(aliasKey)) || null
    }

    for (const data of fewsData) {
      const resolved = resolveRegion(data.region)
      if (!resolved) continue

      const foodPhase = data.foodSecurityPhase
      const severity =
        foodPhase === 'famine'
          ? 'critical'
          : foodPhase === 'emergency'
            ? 'high'
            : foodPhase === 'crisis'
              ? 'medium'
              : 'low'

      await Impact.updateOne(
        { regionId: resolved.id, date: new Date(data.date) },
        {
          $set: {
            region: resolved.name,
            populationAffected: data.populationAffected || 0,
            displacedHouseholds: 0,
            foodInsecurityPhase: foodPhase,
            malnutritionRisk:
              foodPhase === 'famine' || foodPhase === 'emergency'
                ? 'high'
                : foodPhase === 'crisis'
                  ? 'medium'
                  : 'low',
          },
        },
        { upsert: true }
      )

      await Alert.updateOne(
        { regionId: resolved.id, type: 'water', date: new Date(data.date) },
        {
          $set: {
            region: resolved.name,
            severity,
            message: `FEWS ${data.scenario} food insecurity classification is ${foodPhase.toUpperCase()} in ${resolved.name}.`,
            acknowledged: false,
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
