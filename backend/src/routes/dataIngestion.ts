/**
 * Data Ingestion Routes
 * 
 * Endpoints to trigger data fetching from external APIs
 */

import express from 'express'
import { ingestAllData } from '../services/dataIngestion/dataIngestionService'
import { searchHDXDatasets, findSomaliaDroughtDatasets } from '../services/dataIngestion/hdxService'
import { getMODISNDVI } from '../services/dataIngestion/nasaService'
import { getCHIRPSData } from '../services/dataIngestion/chirpsService'
import { getFEWSData } from '../services/dataIngestion/fewsNetService'
import JobRun from '../models/JobRun'

const router = express.Router()

// Test all APIs at once
router.get('/test/all', async (req, res) => {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  // Test 1: NASA MODIS (with your token)
  console.log('🧪 Testing NASA MODIS API...')
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    const startDateStr = startDate.toISOString().split('T')[0]
    
    const nasaToken = process.env.NASA_BEARER_TOKEN
    const nasaUsername = process.env.NASA_USERNAME
    
    const ndviData = await getMODISNDVI(startDateStr, endDate)
    results.tests.nasa = {
      status: 'connected',
      hasToken: !!nasaToken,
      hasUsername: !!nasaUsername,
      authMethod: nasaToken ? 'Bearer Token' : nasaUsername ? 'Username/Password' : 'None',
      dataReceived: ndviData.length > 0,
      message: nasaToken 
        ? '✅ NASA Bearer Token found - API ready (implementation pending)' 
        : nasaUsername 
        ? '✅ NASA Username found - API ready (implementation pending)'
        : '⚠️ NASA credentials not set',
    }
  } catch (error: any) {
    results.tests.nasa = {
      status: 'error',
      error: error.message,
    }
  }

  // Test 2: HDX (no key needed - should work!)
  console.log('🧪 Testing HDX API...')
  try {
    const datasets = await searchHDXDatasets('somalia')
    results.tests.hdx = {
      status: 'connected',
      datasetsFound: datasets.length,
      sampleDatasets: datasets.slice(0, 3).map((d: any) => ({
        title: d.title,
        organization: d.organization,
      })),
      message: `✅ HDX API working! Found ${datasets.length} Somalia datasets`,
    }
  } catch (error: any) {
    results.tests.hdx = {
      status: 'error',
      error: error.message,
    }
  }

  // Test 3: CHIRPS (no key needed)
  console.log('🧪 Testing CHIRPS API...')
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    const startDateStr = startDate.toISOString().split('T')[0]
    
    const chirpsData = await getCHIRPSData(startDateStr, endDate)
    results.tests.chirps = {
      status: 'connected',
      dataReceived: chirpsData.length > 0,
      message: '✅ CHIRPS API accessible (implementation pending - needs file processing)',
    }
  } catch (error: any) {
    results.tests.chirps = {
      status: 'error',
      error: error.message,
    }
  }

  // Test 4: FEWS NET (public data)
  console.log('🧪 Testing FEWS NET API...')
  try {
    const fewsData = await getFEWSData()
    results.tests.fewsNet = {
      status: 'connected',
      dataReceived: fewsData.length > 0,
      message: '✅ FEWS NET accessible (implementation pending - may need file downloads)',
    }
  } catch (error: any) {
    results.tests.fewsNet = {
      status: 'error',
      error: error.message,
    }
  }

  // Summary
  const successCount = Object.values(results.tests).filter((t: any) => t.status === 'connected').length
  const totalCount = Object.keys(results.tests).length
  
  results.summary = {
    total: totalCount,
    successful: successCount,
    message: `${successCount}/${totalCount} APIs connected successfully`,
  }

  res.json(results)
})

// Trigger full data ingestion
router.post('/ingest/all', async (req, res) => {
  try {
    const result = await ingestAllData()
    res.json({ 
      success: true, 
      message: 'Data ingestion completed',
      recordsProcessed: result.recordsProcessed 
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get last job status
router.get('/status', async (req, res) => {
  try {
    const lastJob = await JobRun.findOne()
      .sort({ startedAt: -1 })
      .lean()
    
    if (!lastJob) {
      return res.json({ 
        status: 'no-jobs',
        message: 'No jobs have been run yet' 
      })
    }
    
    res.json({
      status: lastJob.status,
      jobType: lastJob.jobType,
      startedAt: lastJob.startedAt,
      completedAt: lastJob.completedAt,
      recordsProcessed: lastJob.recordsProcessed,
      error: lastJob.error,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Search HDX datasets (for testing)
router.get('/hdx/search', async (req, res) => {
  try {
    const query = (req.query.q as string) || 'somalia'
    const datasets = await searchHDXDatasets(query)
    res.json({ success: true, count: datasets.length, datasets })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router

