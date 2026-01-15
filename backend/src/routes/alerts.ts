import express from 'express'
import { getAlerts } from '../controllers/alertsController'

const router = express.Router()

router.get('/', getAlerts)

export default router

