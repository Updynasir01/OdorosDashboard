import express from 'express'
import { getTimeSeries } from '../controllers/timeseriesController'

const router = express.Router()

router.get('/:regionId', getTimeSeries)

export default router

