import mongoose, { Schema, Document } from 'mongoose'

export interface IRegion extends Document {
  id: string
  name: string
  nameSomali: string
  coordinates: Array<[number, number]>
  droughtLevel: 'normal' | 'watch' | 'warning' | 'emergency'
  rainfallDeficit: number
  lastRainfallDate: Date
  affectedPopulation: number
  ndvi: number
  temperatureAnomaly: number
  waterScarcity: number
  livestockRisk: number
  createdAt: Date
  updatedAt: Date
}

const RegionSchema = new Schema<IRegion>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameSomali: { type: String, required: true },
    coordinates: { type: [[Number]], required: true },
    droughtLevel: {
      type: String,
      enum: ['normal', 'watch', 'warning', 'emergency'],
      required: true,
    },
    rainfallDeficit: { type: Number, required: true },
    lastRainfallDate: { type: Date, required: true },
    affectedPopulation: { type: Number, required: true },
    ndvi: { type: Number, required: true },
    temperatureAnomaly: { type: Number, required: true },
    waterScarcity: { type: Number, required: true },
    livestockRisk: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IRegion>('Region', RegionSchema)

