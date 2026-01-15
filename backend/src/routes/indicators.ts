import express from 'express'
import { getIndicators } from '../controllers/indicatorsController'

const router = express.Router()

router.get('/', getIndicators)

export default router

