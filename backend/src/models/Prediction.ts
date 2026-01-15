import mongoose, { Schema, Document } from 'mongoose'

export interface IPrediction extends Document {
  regionId: string
  region: string
  predictionDate: Date
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  timeframe: string
  confidence: number
  factors: string[]
  createdAt: Date
}

const PredictionSchema = new Schema<IPrediction>(
  {
    regionId: { type: String, required: true },
    region: { type: String, required: true },
    predictionDate: { type: Date, required: true },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    timeframe: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    factors: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
PredictionSchema.index({ regionId: 1, predictionDate: -1 })

export default mongoose.model<IPrediction>('Prediction', PredictionSchema)

