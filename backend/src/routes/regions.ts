import express from 'express'
import { getRegions, getRegionById } from '../controllers/regionsController'

const router = express.Router()

router.get('/', getRegions)
router.get('/:id', getRegionById)

export default router

