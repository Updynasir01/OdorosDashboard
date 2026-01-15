import mongoose, { Schema, Document } from 'mongoose'

export interface IImpact extends Document {
  regionId: string
  region: string
  date: Date
  populationAffected: number
  displacedHouseholds: number
  foodInsecurityPhase: 'minimal' | 'stressed' | 'crisis' | 'emergency' | 'famine'
  malnutritionRisk: 'low' | 'medium' | 'high'
  createdAt: Date
}

const ImpactSchema = new Schema<IImpact>(
  {
    regionId: { type: String, required: true },
    region: { type: String, required: true },
    date: { type: Date, required: true },
    populationAffected: { type: Number, required: true },
    displacedHouseholds: { type: Number, required: true },
    foodInsecurityPhase: {
      type: String,
      enum: ['minimal', 'stressed', 'crisis', 'emergency', 'famine'],
      required: true,
    },
    malnutritionRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
ImpactSchema.index({ regionId: 1, date: -1 })
ImpactSchema.index({ regionId: 1, date: 1 }, { unique: true })

export default mongoose.model<IImpact>('Impact', ImpactSchema)

