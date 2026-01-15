import express from 'express'
import { getImpactData } from '../controllers/impactController'

const router = express.Router()

router.get('/', getImpactData)

export default router

