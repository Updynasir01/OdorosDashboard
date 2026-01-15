import express from 'express'
import { getPredictions } from '../controllers/predictionsController'

const router = express.Router()

router.get('/', getPredictions)

export default router

